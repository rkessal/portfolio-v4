import { Transform, Plane } from "ogl"
import { canvas } from "../canvas"
import ProjectMedia from "./project-media"
import gsap from "gsap"
import normalizeWheel from "normalize-wheel"
import { lenis } from "../lenis"

const gl = canvas.gl

export function createProjectCanvas() {
  let medias = null
  let group = null
  let projectWrapper = null

  let offInit = null
  let offScroll = null
  let offResize = null
  let offUpdate = null

  let offTransition = null
  let offTransitionProject = null
  let isTransitioning = false
  let currentProject = null
  let hasInitialized = false

  let scroll = {
    ease: lenis.lenis.options.lerp,
    current: 0,
    target: 0,
    last: 0,
    strength: 0.5,
    limit: 0,
    direction: 'stopped',
    overflowThreshold: window.innerWidth * 0.01,
    overscroll: 0,
    maxSpeed: 0.025
  }

  let nextProject = {
    percent: 0,
    counter: null,
    link: null
  }
  let destroyed = false

  if (offInit) offInit()
  offInit = canvas.on('init', init)
  offTransition = canvas.on('transition-home->project', transitionIn)
  offTransitionProject = canvas.on('transition-project->project', transitionProjectProject)
  canvas.registerCanvas('project', { getState })

  function init({ namespace, transitionMedia, params, from } = {}) {
    if (hasInitialized || !params?.id || isTransitioning || namespace !== 'project' || destroyed) return

    canvas.precompileShaders()

    currentProject = params.id
    hasInitialized = true

    onTransition()

    projectWrapper = document.querySelector(`[data-project-id="${currentProject}"] .project__container`)
    nextProject.link = projectWrapper.querySelector('.project__next-project__link__wrapper')
    nextProject.counter = projectWrapper.querySelector('.project__next-project__counter')

    offScroll = canvas.on('scroll', onScroll)
    offResize = canvas.on('resize', onResize)
    offUpdate = canvas.on('update', update)

    group = new Transform()
    group.setParent(canvas.scene)
    group.name = `project-${currentProject}`

    const elements = [...projectWrapper.querySelectorAll('.project__main-image img, .project__media__item img, .project__next-project__image img')]
    medias = elements.map((element, index) => new ProjectMedia({
      element,
      geometry: canvas.geometry,
      scene: group,
      index,
      scroll,
      nextProject,
    }))

    medias.forEach(media => media.enter(onFinishTransition, transitionMedia))

    onResize()
  }

  function onTransition() {
    isTransitioning = true
  }

  function onFinishTransition(index, transitionMedia) {
    canvas.handleScroll(false)
    isTransitioning = false
    if (transitionMedia) {
      transitionMedia.destroy()
    }
  }

  function onScroll(e) {
    if (isTransitioning) {
      return
    }
    const { pixelY } = normalizeWheel(e)
    const delta = pixelY * canvas.sizes.ratioX * scroll.strength

    if (scroll.target <= -scroll.limit) {
      if (delta > 0) {
        scroll.overscroll = gsap.utils.clamp(0, scroll.overflowThreshold, scroll.overscroll + delta)
      } else {
        scroll.overscroll = gsap.utils.clamp(0, scroll.overflowThreshold, scroll.overscroll + delta)
        if (scroll.overscroll <= 0) {
          scroll.target -= delta
        }
      }
    } else {
      scroll.target -= delta
    }
  }

  function onResize() {
    scroll.limit = (projectWrapper.scrollWidth - window.innerWidth) * canvas.sizes.ratioX
    scroll.current = 0
    scroll.target = 0
    scroll.last = 0
    scroll.overscroll = null
  }

  function update() {
    scroll.target = gsap.utils.clamp(-scroll.limit, 0, scroll.target)
    scroll.current = gsap.utils.interpolate(scroll.current, scroll.target, scroll.ease)
    const diff = scroll.current - scroll.last
    scroll.direction = diff > 0 ? 'down' : diff < 0 ? 'up' : 'stopped'

    const speed = Math.abs(diff)
    if (speed <= scroll.maxSpeed) {
      nextProject.percent = Math.round((scroll.overscroll / scroll.overflowThreshold) * 100)
      if (nextProject.percent > 0) {
        onOverscroll(nextProject.percent)
      }
    } else {
      scroll.overscroll = 0
      nextProject.percent = 0
    }

    medias.forEach(media => {
      media.mesh.position.x += diff
      media.program.uniforms.uStrength.value = diff / canvas.sizes.height
      const distFromCenter = media.mesh.position.x / canvas.sizes.width
      media.program.uniforms.uRotation.value = gsap.utils.clamp(0, 1, distFromCenter)
      if (media.index !== medias.length - 1) {
        media.program.uniforms.uSaturation.value = gsap.utils.clamp(0, 1, distFromCenter)
      } else {
        if (isTransitioning) return
        media.program.uniforms.uSaturation.value = -0.5 * (nextProject.percent / 100) + 0.5
      }
    })

    gsap.set(projectWrapper, { x: scroll.current / canvas.sizes.ratioX })


    scroll.last = scroll.current
  }

  function onOverscroll(percent) {
    if (destroyed) return
    const cleanPercent = gsap.utils.clamp(0, 100, percent)
    if (nextProject.counter.innerText !== `${cleanPercent}%`) {
      nextProject.counter.innerText = `${cleanPercent}%`
    }

    if (percent >= 100) {
      nextProject.link.click()
      destroyed = true
      return
    }
  }

  function cleanup() {
    destroyed = true
    offInit()
    offTransition()
    offTransitionProject()
    offScroll()
    offResize()
    offUpdate()
    medias.forEach(m => m.destroy())
    group.setParent(null)
    isTransitioning = false
    medias = null
    group = null
    projectWrapper = null
    nextProject = {
      percent: 0,
      counter: null,
      link: null
    }
  }

  function getState() {
    return { medias, isTransitioning, scroll, name: 'project' }
  }

  function transitionIn({ currentMedia, params }) {
    init({ namespace: 'project', transitionMedia: currentMedia, params, from: 'transitionIn' })
  }

  function transitionProjectProject({ currentMedia, params }) {
    init({ namespace: 'project', transitionMedia: currentMedia, params, from: 'transitionProject' })
  }

  return { init, cleanup, getState, transitionIn, onTransition }
}