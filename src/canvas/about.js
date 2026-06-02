import { Transform, Plane } from "ogl"
import { canvas } from "../canvas"
import gsap from "gsap"
import normalizeWheel from "normalize-wheel"
import AboutMedia from "./about-media"
import { lenis } from "../lenis"

const gl = canvas.gl

export function createAboutCanvas() {
  let medias = null
  let group = null
  let gallery = null
  let aboutWrapper = null
  let offInit = null
  let offScroll = null
  let offResize = null
  let offUpdate = null
  let offTransition = null
  let isTransitioning = false
  let currentProjectIndex = 0
  let hasInitialized = false

  let scroll = {
    ease: lenis.lenis.options.lerp,
    current: 0,
    target: 0,
    last: 0,
    strength: 1.,
    limit: 0,
    direction: 'stopped',
  }

  if (offInit) offInit()
  offInit = canvas.on('init', init)
  offTransition = canvas.on('transition-home->about', transitionIn)
  canvas.registerCanvas('about', { getState })

  function init({ transitionMedia, namespace } = {}) {
    if (hasInitialized || isTransitioning || namespace !== 'about') return

    hasInitialized = true

    onTransition()

    offScroll = canvas.on('scroll', onScroll)
    offResize = canvas.on('resize', onResize)
    offUpdate = canvas.on('update', update)

    group = new Transform()
    group.setParent(canvas.scene)

    aboutWrapper = document.querySelector('.about__description')
    // gallery = document.querySelector('.home__projects__gallery')

    const geometry = new Plane(gl, {
      heightSegments: 20,
      widthSegments: 20
    })

    const elements = [...aboutWrapper.querySelectorAll('img')]
    medias = elements.map((element, index) => new AboutMedia({
      element,
      geometry,
      scene: group,
      index,
      scroll,
    }))

    const delay = 0.8
    medias.forEach(media => {
      media.enter(onFinishTransition, delay)
    })
    onResize()
  }

  function onTransition() {
    isTransitioning = true
  }

  function onFinishTransition(index) {
    if (index === medias.length - 1 && isTransitioning) {
      isTransitioning = false
      canvas.handleScroll(false)
    }
  }

  function onScroll(e) {
    if (isTransitioning) {
      return
    }
    const { pixelY } = normalizeWheel(e)
    scroll.target -= pixelY * canvas.sizes.ratioY * scroll.strength
  }

  function onResize() {
    const bounds = aboutWrapper.getBoundingClientRect()
    scroll.limit = (bounds.height + bounds.top - window.innerHeight) * canvas.sizes.ratioY
    scroll.current = 0
    scroll.target = 0
    scroll.last = 0
  }

  function update() {
    scroll.target = gsap.utils.clamp(-scroll.limit, 0, scroll.target)
    scroll.current = gsap.utils.interpolate(scroll.current, scroll.target, scroll.ease)
    const diff = scroll.current - scroll.last
    scroll.direction = diff > 0 ? 'down' : diff < 0 ? 'up' : 'stopped'


    medias.forEach((media, i) => {
      media.mesh.position.y -= diff
      media.program.uniforms.uStrength.value = (diff / canvas.sizes.height) * 0.25

      const distFromCenter = (media.mesh.position.y / canvas.sizes.height) + 0.5
      media.program.uniforms.uSaturation.value = gsap.utils.clamp(0, 1, distFromCenter)
    })

    scroll.last = scroll.current
  }

  function cleanup() {
    offInit()
    offScroll()
    offResize()
    offUpdate()
    offTransition()
    medias.forEach(m => {
      m.destroy()
    })

    group.setParent(null)
    isTransitioning = false
    medias = null
    group = null
  }

  function getState() {
    return { medias, isTransitioning, scroll, currentProjectIndex, name: 'about' }
  }

  function transitionIn({ transitionMedia } = {}) {
    init({ transitionMedia, namespace: 'about' })
  }

  return { init, cleanup, getState, transitionIn, onTransition }
}