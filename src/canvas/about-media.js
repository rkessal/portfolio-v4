import { Mesh, Program, Texture } from "ogl"
import { canvas } from "../canvas"
import fragment from '../shaders/about-plane-fragment.glsl'
import vertex from '../shaders/about-plane-vertex.glsl'
import gsap from "gsap"

export default class AboutMedia {
  constructor({ element, geometry, scene, index, gallery }) {
    this.element = element
    this.geometry = geometry
    this.scene = scene
    this.index = index
    this.gl = canvas.gl
    this.originalScale = {
      x: 0,
      y: 0
    }

    this.sizes = canvas.sizes

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createBounds()

    this.offResize = canvas.on('resize', this.onResize.bind(this))
  }

  createTexture() {
    const cached = canvas.getTexture(this.element.getAttribute('data-src'))
    console.log(this.element.getAttribute('data-src'), cached)

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

    this.originalScale.x = this.mesh.scale.x
    this.originalScale.y = this.mesh.scale.y

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

  enter(onFinishTransition, delay = 0) {
    gsap.fromTo(this.program.uniforms.uStrength,
      { value: 0.05 },
      {
        value: 0.0,
        duration: 2,
        delay: delay + (this.index * 0.1),
        ease: 'expo.out',
        onComplete: () => onFinishTransition(this.index)
      }
    )
    gsap.to(this.program.uniforms.uAlpha, {
      value: 1,
      duration: 2,
      delay: delay + (this.index * 0.1),
      ease: 'expo.out',
    })
    gsap.to(this.program.uniforms.uProgress, {
      value: 1,
      duration: 2,
      delay: delay + (this.index * 0.1),
      ease: 'expo.out',
    })
  }

  destroy() {
    this.offResize()

    if (!this.isTransition) {
      this.mesh.setParent(null)
    }
  }
}