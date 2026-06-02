import { Camera, Program, Renderer, Transform, Mesh, Box, Texture } from "ogl";

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
  }

  init() {
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

    this.createScene()
    this.createCamera()
    this.onResize()

    this.update()
  }

  on(event, fn) {
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

  update() {
    if (!this.renderer) return

    this.renderer.render({
      camera: this.camera,
      scene: this.scene,
    })

    this.emit('update')
    requestAnimationFrame(this.update)
  }

  async preload(srcs) {
    console.log(srcs)
    const promises = srcs.map(({ key, url }) => {
      if (this.textureCache.has(key)) return Promise.resolve()

      return new Promise(resolve => {
        const texture = new Texture(this.gl, {
          generateMipmaps: false,
          minFilter: this.gl.LINEAR,
          magFilter: this.gl.LINEAR,
        })

        console.log(url)
        const image = new Image()
        image.src = url
        image.onload = () => {
          texture.image = image
          this.textureCache.set(key, texture)
          resolve()
        }

        image.onerror = (err) => {
          // console.log(err)
          resolve()
        }
      })
    })

    await Promise.all(promises)
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
    if (lock) {
      lenis.lenis.stop()
    } else {
      lenis.lenis.start()
    }
  }

}

export const canvas = new Canvas()