import { Transform, Plane } from "ogl"
import { canvas } from "../canvas"
import ProjectMedia from "./project-media"
import gsap from "gsap"
import { SWITCH_PROJECT_INDEX } from "../animations/projects/main"
import normalizeWheel from "normalize-wheel"
import ENTER from "../animations/enter"
import { router } from "../router"

const gl = canvas.gl
let medias = null
let group = null
let gallery = null

let projectWrapper = null

let offInit = null
let offScroll = null
let offResize = null
let offUpdate = null
let offTransition = null
let offTransitionProject = null

let isTransitioning = false

let scroll = {
  ease: 0.05,
  current: 0,
  target: 0,
  last: 0,
  strength: 0.5,
  limit: 0,
  direction: 'stopped',
}

let currentProject = null

export default function createProjectCanvas() {
  if (offInit) offInit()
  offInit = canvas.on('init', init)
  offTransition = canvas.on('transition-home->project', transitionHomeProject)
  offTransitionProject = canvas.on('transition-project->project', transitionProjectProject)
  canvas.registerCanvas('project', {
    getState: () => ({ isTransitioning })
  })
}

export function getState() {
  return {
    medias,
    isTransitioning,
  }
}

export function onTransition() {
  isTransitioning = true
}

export function init({ namespace, previousNamespace, transitionMedia, params }) {
  console.log(transitionMedia, isTransitioning)
  currentProject = params?.id
  if (!params.id || isTransitioning || namespace !== 'project') {
    return
  }
  isTransitioning = true

  offScroll = canvas.on('scroll', onScroll)
  offResize = canvas.on('resize', onResize)
  offUpdate = canvas.on('update', update)

  group = new Transform()
  group.setParent(canvas.scene)

  projectWrapper = document.querySelector(`[data-project-id="${currentProject}"] .project__container`)

  const geometry = new Plane(gl, {
    heightSegments: 20,
    widthSegments: 20
  })
  const elements = [...projectWrapper.querySelectorAll('.project__main-image img, .project__media__item img, .project__next-project__image img')]
  medias = elements.map((element, index) => new ProjectMedia({
    element,
    geometry,
    scene: group,
    index,
    scroll,
  }))

  medias.filter((media, index) => {
    if (transitionMedia) {
      console.log('passed')
      return index !== 0
    } else {
      return true
    }
  }).forEach((media, index) => media.enter(onFinishTransition, transitionMedia))

  onResize()
}

async function transitionHomeProject({ currentMedia, params }) {
  init({ namespace: 'project', transitionMedia: currentMedia, params })
  currentMedia.mesh.setParent(group)
  currentMedia.isTransition = true
}

async function transitionProjectProject({ currentMedia, params }) {
  console.log(currentMedia)
  init({ namespace: 'project', transitionMedia: currentMedia, params })
  currentMedia.isTransition = true
}

function onFinishTransition(index, transitionMedia) {
  if (transitionMedia) {
    transitionMedia.isTransition = false
    transitionMedia.destroy()
  }

  if (isTransitioning) {
    isTransitioning = false
  }
}

function onScroll(e) {
  if (isTransitioning) return
  const { pixelY } = normalizeWheel(e)
  scroll.target -= pixelY * canvas.sizes.ratioX * scroll.strength
}

function onResize() {
  const first = medias[0].mesh
  const last = medias[medias.length - 1].mesh
  scroll.limit = (projectWrapper.scrollWidth - window.innerWidth) * canvas.sizes.ratioX
  scroll.current = 0
  scroll.target = 0
  scroll.last = 0
}

function update() {
  scroll.target = gsap.utils.clamp(-scroll.limit, 0, scroll.target)
  scroll.current = gsap.utils.interpolate(scroll.current, scroll.target, scroll.ease)
  const diff = scroll.current - scroll.last
  scroll.direction = diff > 0 ? 'down' : diff < 0 ? 'up' : 'stopped'

  medias.forEach((media, index) => {
    media.mesh.position.x += diff
    media.program.uniforms.uStrength.value = diff / canvas.sizes.height

    const distFromCenter = media.mesh.position.x / canvas.sizes.width
    media.program.uniforms.uRotation.value = gsap.utils.clamp(0, 1, distFromCenter)
  })
  gsap.set(projectWrapper, { x: scroll.current / (canvas.sizes.ratioX) })

  const wrapperBounds = projectWrapper.getBoundingClientRect()
  const firstElementBounds = medias[0].element.getBoundingClientRect()

  scroll.last = scroll.current
}

export function cleanup() {
  const _group = group
  const _medias = medias
  const _offScroll = offScroll
  const _offResize = offResize
  const _offUpdate = offUpdate

  _offScroll?.()
  _offResize?.()
  _offUpdate?.()
  _medias?.forEach(m => m.destroy())
  _group?.setParent(null)

  isTransitioning = false
  medias = null
  group = null
}
