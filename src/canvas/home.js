import { Transform, Plane } from "ogl"
import { canvas } from "../canvas"
import HomeMedia from "./home-media"
import gsap from "gsap"
import { SWITCH_PROJECT_INDEX } from "../animations/projects/main"
import normalizeWheel from "normalize-wheel"
import { lenis } from "../lenis"

const gl = canvas.gl

export function createHomeCanvas() {
  let medias = null
  let group = null
  let gallery = null
  let galleryWrapper = null
  let offInit = null
  let offScroll = null
  let offResize = null
  let offUpdate = null
  let offTransitionProject = null
  let offTransitionAbout = null
  let isTransitioning = false
  let currentProjectIndex = 0
  let hasInitialized = false
  let hovering = false

  let scroll = {
    ease: lenis.lenis.options.lerp,
    current: 0,
    target: 0,
    last: 0,
    strength: 0.4,
    limit: 0,
    direction: 'stopped',
  }

  if (offInit) offInit()
  offInit = canvas.on('init', init)
  offTransitionProject = canvas.on('transition-project->home', transitionIn)
  offTransitionAbout = canvas.on('transition-about->home', transitionIn)
  canvas.registerCanvas('home', { getState })

  function init({ transitionMedia, namespace } = {}) {
    if (hasInitialized || isTransitioning || namespace !== 'home') return

    hovering = false
    hasInitialized = true

    onTransition()

    offScroll = canvas.on('scroll', onScroll)
    offResize = canvas.on('resize', onResize)
    offUpdate = canvas.on('update', update)

    group = new Transform()
    group.setParent(canvas.scene)

    galleryWrapper = document.querySelector('.home__projects')
    gallery = document.querySelector('.home__projects__gallery')

    const geometry = new Plane(gl, {
      heightSegments: 20,
      widthSegments: 20
    })

    const elements = [...document.querySelectorAll('.home__projects__item__img img')]
    medias = elements.map((element, index) => new HomeMedia({
      element,
      geometry,
      scene: group,
      index,
      scroll,
      hovering,
    }))

    const delay = 0.8
    medias.forEach(media => {
      media.enter(onFinishTransition, delay)
      media.element.addEventListener('mouseenter', () => onMouseEnter(media))
      media.element.addEventListener('mouseleave', () => onMouseLeave(media))
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

  function onMouseEnter(media) {
    if (isTransitioning) {
      return
    }

    hovering = true

    media.mesh.position.z = 0.00011

    selectProject(media.index)

    gsap.to(media.program.uniforms.uSaturation, {
      value: 1,
      duration: 0.5,
      ease: 'expo.out',
    })

    gsap.to(media.mesh.scale, {
      x: media.mesh.scale.x * 1.1,
      y: media.mesh.scale.y * 1.1,
      duration: 1.5,
      ease: 'expo.out'
    })

    medias.filter(m => m !== media).forEach(m => {
      gsap.to(m.program.uniforms.uSaturation, {
        value: 0,
        duration: 1,
        ease: 'expo.out',
      })
    })
  }

  function onMouseLeave(media) {
    if (isTransitioning) {
      return
    }

    hovering = false

    media.mesh.position.z = 0.00001

    gsap.to(media.program.uniforms.uSaturation, {
      value: 0,
      duration: 0.5,
      ease: 'expo.inOut',
    })

    gsap.to(media.mesh.scale, {
      x: media.originalScale.x,
      y: media.originalScale.y,
      duration: 1.5,
      ease: 'expo.out'
    })

    medias.filter(m => m !== media).forEach(m => {
      gsap.to(m.program.uniforms.uSaturation, {
        value: 0,
        duration: 0.5,
        ease: 'expo.inOut',
      })
    })
  }

  function onScroll(e) {
    if (isTransitioning) {
      return
    }
    const { pixelY } = normalizeWheel(e)
    scroll.target -= pixelY * canvas.sizes.ratioY * scroll.strength
  }

  function onResize() {
    const first = medias[0].mesh
    const last = medias[medias.length - 1].mesh
    scroll.limit = Math.abs(last.position.y - first.position.y) + (last.scale.y / 2) - (first.scale.y / 2)
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
      media.program.uniforms.uStrength.value = diff / canvas.sizes.height

      if (!hovering && !isTransitioning) {
        const targetSaturation = i === currentProjectIndex ? 1.0 : 0.0
        media.program.uniforms.uSaturation.value = gsap.utils.interpolate(
          media.program.uniforms.uSaturation.value,
          targetSaturation,
          0.05
        )
      }
    })

    gsap.set(gallery, { y: scroll.current / canvas.sizes.ratioY })

    const wrapperBounds = galleryWrapper.getBoundingClientRect()
    const firstElementBounds = medias[0].element.getBoundingClientRect()
    scroll.offsetY = ((wrapperBounds.top + (firstElementBounds.height / 2)) / window.innerHeight) * canvas.sizes.height

    if (!hovering) {
      selectProject()
    }

    scroll.last = scroll.current
  }

  function selectProject(i) {
    const threshold = canvas.sizes.height / 2 - scroll.offsetY

    if (i) {
      SWITCH_PROJECT_INDEX(currentProjectIndex, i, scroll.direction)
      currentProjectIndex = i
      return
    }

    const index = medias.reduce((closestIndex, media, i) => {
      const current = Math.abs(medias[closestIndex].mesh.position.y - threshold)
      const next = Math.abs(media.mesh.position.y - threshold)
      return next < current ? i : closestIndex
    }, 0)

    if (index !== currentProjectIndex) {
      SWITCH_PROJECT_INDEX(currentProjectIndex, index, scroll.direction)
      currentProjectIndex = index

      return
    }
  }

  function cleanup() {
    offInit()
    offScroll()
    offResize()
    offUpdate()
    offTransitionAbout()
    offTransitionProject()
    medias.forEach(m => {
      m.destroy()
      m.element.removeEventListener('mouseenter', () => onMouseEnter(m.element))
      m.element.removeEventListener('mouseleave', () => onMouseLeave(m.element))
    })

    group.setParent(null)
    isTransitioning = false
    medias = null
    group = null
  }

  function getState() {
    return { medias, isTransitioning, scroll, currentProjectIndex, name: 'home' }
  }

  function transitionIn({ transitionMedia } = {}) {
    init({ transitionMedia, namespace: 'home' })
  }

  return { init, cleanup, getState, transitionIn, onTransition }
}