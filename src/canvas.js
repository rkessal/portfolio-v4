import { Camera, Program, Renderer, Transform, Mesh, Box, Texture, Plane } from "ogl";
const worker = new Worker(new URL('./worker.js', import.meta.url))


import fragment from './shaders/plane-fragment.glsl'
import vertex from './shaders/plane-vertex.glsl'
import gsap from "gsap";
import { lenis } from "./lenis";

class Canvas {
  constructor() {
    this.update = this.update.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.listeners = {}
    this.textureCache = new Map()
    this.registeredCanvas = new Map()

    this.mq = window.matchMedia('(max-width: 768px)')
    this.mq.addEventListener('change', this.onBreakpointChange.bind(this))
  }

  init() {
    if (this.isMobile()) {
      return
    }

    this.renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
      antialias: true,
    })
    this.gl = this.renderer.gl
    this.gl.canvas.className = 'ogl'

    document.body.appendChild(this.gl.canvas)

    window.addEventListener('resize', this.onResize, { passive: true })
    window.addEventListener('wheel', this.onScroll, false)

    this.createGeometry()
    this.createScene()
    this.createCamera()
    this.onResize()

    this.update()
  }

  on(event, fn) {
    if (this.isMobile()) {
      return
    }

    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
    return () => this.off(event, fn) // returns unsubscribe fn
  }

  off(event, fn) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(l => l !== fn)
  }

  emit(event, ...args) {
    this.listeners[event]?.forEach(fn => fn(...args))
  }

  createGeometry() {
    this.geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 20
    })
  }

  createScene() {
    this.scene = new Transform()
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
    this.camera.fov = 45
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.sizes = {
      height,
      width,
      ratioY: height / window.innerHeight,
      ratioX: width / window.innerWidth,
    }

    lenis.lenis.scrollTo(0, {
      immediate: true
    })

    this.emit('resize', this.sizes)
  }

  onScroll(event) {
    if (this.isTransitioning()) return
    this.emit('scroll', event)
  }

  onBreakpointChange(e) {
    if (e.matches) {
      this.destroy()
    } else {

      // bruh
      window.location.reload()
    }
  }

  update() {
    if (!this.renderer) return

    this.renderer.render({
      camera: this.camera,
      scene: this.scene,
    })

    this.emit('update')
    requestAnimationFrame(this.update)
  }

  forceGPUUpload() {
    const gl = this.gl
    this.textureCache.forEach(texture => {
      if (!texture.texture) texture.texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture.texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture._bitmap ?? texture.image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindTexture(gl.TEXTURE_2D, null)
      texture.needsUpdate = false // tell OGL it's already uploaded
    })
  }

  precompileShaders() {
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scene.children.forEach(child => {
      if (child.program) {
        const gl = this.gl
        gl.useProgram(child.program.program)
        const ext = gl.getExtension('KHR_parallel_shader_compile')
        if (ext) {
          gl.getProgramParameter(child.program.program, ext.COMPLETION_STATUS_KHR)
        }
      }
    })
  }

  async preload(srcs, onProgress) {
    if (this.isMobile()) return

    const pending = new Map()
    let loaded = 0
    const total = srcs.filter(({ key }) => !this.textureCache.has(key)).length

    worker.onmessage = ({ data }) => {
      const resolve = pending.get(data.key)
      if (resolve) {
        resolve({ key: data.key, bitmap: data.bitmap })
        pending.delete(data.key)
      }
    }

    const promises = srcs.map(({ key, url }) => {
      if (this.textureCache.has(key)) return Promise.resolve()
      return new Promise(resolve => {
        pending.set(key, resolve)
        worker.postMessage({ url, key })
      })
    })

    const results = (await Promise.all(promises)).filter(Boolean)

    await new Promise(resolve => {
      let i = 0
      const uploadNext = () => {
        if (i >= results.length) {
          this.forceGPUUpload()
          return resolve()
        }
        const { key, bitmap } = results[i++]
        const texture = new Texture(this.gl, {
          generateMipmaps: false,
          minFilter: this.gl.LINEAR,
          magFilter: this.gl.LINEAR,
        })
        texture.image = bitmap
        texture._bitmap = bitmap
        this.textureCache.set(key, texture)

        loaded++
        onProgress?.(loaded / total, loaded, total)

        requestAnimationFrame(uploadNext)
      }
      requestAnimationFrame(uploadNext)
    })
  }

  getTexture(src) {
    return this.textureCache.get(src)
  }

  registerCanvas(name, canvas) {
    this.registeredCanvas.set(name, canvas)
  }

  isTransitioning() {
    for (const c of this.registeredCanvas.values()) {
      if (c.getState().isTransitioning) {
        return true
      }
    }

    return false
  }

  handleScroll(lock) {
    if (this.isMobile()) {
      return
    }

    if (lock) {
      lenis.lenis.stop()
    } else {
      lenis.lenis.start()
    }
  }

  isMobile() {
    return this.mq.matches
  }

  destroy() {
    if (!this.renderer) return
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('wheel', this.onScroll)
    this.gl.canvas.remove()
    this.renderer = null
    this.gl = null
    this.scene = null
    this.camera = null
    this.sizes = null
    this.emit('webgl-disabled')
    this.listeners = {}
  }

}

export const canvas = new Canvas()