import { Mesh, Program, Texture } from "ogl"
import { canvas } from "../canvas"
import fragment from '../shaders/plane-fragment.glsl'
import vertex from '../shaders/plane-vertex.glsl'
import gsap from "gsap"

export default class HomeMedia {
  constructor({ element, geometry, scene, index, gallery }) {
    this.element = element
    this.geometry = geometry
    this.scene = scene
    this.index = index
    this.gl = canvas.gl

    this.sizes = canvas.sizes

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createBounds()

    this.offResize = canvas.on('resize', this.onResize.bind(this))
    this.offScroll = canvas.on('scroll', this.onScroll.bind(this))
    this.offUpdate = canvas.on('update', this.update.bind(this))

    this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this))
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this))
  }

  createTexture() {
    const cached = canvas.getTexture(this.element.src)

    this.texture = cached
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: { value: this.texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [this.texture.image.naturalWidth, this.texture.image.naturalHeight] },
        uViewportSizes: { value: [this.sizes.width, this.sizes.height] },
        uStrength: { value: 0.0 },
        uProgress: { value: 0 },
        uAlpha: { value: 0.0 },
        uSaturation: { value: 0 },
        uRGBSplit: { value: 0 }
      }
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })
    this.mesh.setParent(this.scene)
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect()
    this.updateScale()
    this.updateSizes()
  }

  getTransition() {
    return this.isTransition
  }

  updateScale() {
    this.width = this.bounds.width / window.innerWidth
    this.height = this.bounds.height / window.innerHeight

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height

    this.program.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y]
  }

  updateSizes() {
    const x = (this.bounds.left) / window.innerWidth
    const y = (this.bounds.top) / window.innerHeight

    this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (x * this.sizes.width)
    this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (y * this.sizes.height)
    this.program.uniforms.uViewportSizes.value = [this.sizes.width, this.sizes.height]
  }

  onResize(sizes) {
    this.sizes = sizes ?? canvas.sizes
    this.createBounds()
  }

  onMouseEnter() {
  }

  onMouseLeave() {
  }

  onScroll(e) {
  }

  update() {
  }

  enter(onFinishTransition) {
    gsap.fromTo(this.program.uniforms.uStrength,
      { value: 0.05 },
      {
        value: 0.0,
        duration: 2,
        delay: 0.8 + (this.index * 0.1),
        ease: 'expo.out',
        onComplete: () => onFinishTransition(this.index)
      }
    )
    gsap.to(this.program.uniforms.uAlpha, {
      value: 1,
      duration: 2,
      delay: 0.8 + (this.index * 0.1),
      ease: 'expo.out',
    })
    gsap.to(this.program.uniforms.uProgress, {
      value: 1,
      duration: 2,
      delay: 0.8 + (this.index * 0.1),
      ease: 'expo.out',
    })
  }

  async transitionToProject(tl, bounds) {
    const x = bounds.left / window.innerWidth
    const y = bounds.top / window.innerHeight

    const targetScaleX = this.sizes.width * (bounds.width / window.innerWidth)
    const targetScaleY = this.sizes.height * (bounds.height / window.innerHeight)

    const targetX = (-this.sizes.width / 2) + (targetScaleX / 2) + (x * this.sizes.width)
    const targetY = (this.sizes.height / 2) - (targetScaleY / 2) - (y * this.sizes.height)

    const startX = this.mesh.position.x
    const startY = this.mesh.position.y
    const totalDist = Math.hypot(targetX - startX, targetY - startY)


    this.mesh.position.z = 0.01

    tl.to(this.mesh.scale, {
      x: targetScaleX,
      y: targetScaleY,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.program.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y]
        this.program.uniforms.uViewportSizes.value = [this.sizes.width, this.sizes.height]

        const dist = Math.hypot(
          this.mesh.position.x - targetX,
          this.mesh.position.y - targetY
        )
        const t = dist / totalDist  // 1 at start, 0 at arrival
        this.program.uniforms.uStrength.value = Math.sin(t * Math.PI) * -0.01
      }
    }, '<')
    tl.to(this.mesh.position, {
      x: targetX,
      y: targetY,
      duration: 1.6,
      ease: 'power2.inOut',
    }, "<")
  }

  destroy() {
    this.offResize()
    this.offScroll()

    this.element.removeEventListener('mouseenter', this.onMouseEnter)
    this.element.removeEventListener('mouseleave', this.onMouseLeave)

    if (!this.isTransition) {
      this.mesh.setParent(null)
    }
  }
}