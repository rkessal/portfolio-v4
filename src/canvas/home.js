import { Transform, Plane } from "ogl"
import { canvas } from "../canvas"
import HomeMedia from "./home-media"
import gsap from "gsap"
import { SWITCH_PROJECT_INDEX } from "../animations/projects/main"
import normalizeWheel from "normalize-wheel"
import ENTER from "../animations/enter"
import { router } from "../router"

const gl = canvas.gl
let medias = null
let group = null
let gallery = null

let galleryWrapper = null

let offInit = null
let offScroll = null
let offResize = null
let offUpdate = null
let offTransition = null

let scroll = {
  ease: 0.05,
  current: 0,
  target: 0,
  last: 0,
  strength: 0.2,
  limit: 0,
  direction: 'stopped',
}

let currentProjectIndex = 0
let isTransitioning = false

export default function createHomeCanvas() {
  if (offInit) offInit()
  offInit = canvas.on('init', init)
  offTransition = canvas.on('transition-project->home', transitionProjectHome)
  canvas.registerCanvas('home', {
    getState: () => ({ isTransitioning })
  })
}

export function getState() {
  return {
    medias,
    isTransitioning
  }
}

export function onTransition() {
  isTransitioning = true
}

export function init({ namespace, previousNamespace, transitionMedia }) {
  console.log('init home')
  if (isTransitioning || namespace !== 'home') {
    return
  }

  isTransitioning = true

  offScroll = canvas.on('scroll', onScroll)
  offResize = canvas.on('resize', onResize)
  offUpdate = canvas.on('update', update)

  group = new Transform()
  group.setParent(canvas.scene)

  galleryWrapper = document.querySelector('.home__projects')
  gallery = document.querySelector('.home__projects__gallery')
  const galleryBounds = gallery.getBoundingClientRect()

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
  }))

  medias.forEach((media, index) => media.enter(onFinishTransition))

  onResize()
}

async function transitionProjectHome() {
  init({ namespace: 'home' })
}

function onFinishTransition(index) {
  if (index === medias.length - 1 && isTransitioning) {
    isTransitioning = false
  }
}

function onScroll(e) {
  if (isTransitioning) return

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

    const targetSaturation = i === currentProjectIndex ? 1.0 : 0.0
    media.program.uniforms.uSaturation.value = gsap.utils.interpolate(
      media.program.uniforms.uSaturation.value,
      targetSaturation,
      0.05
    )
  })

  gsap.set(gallery, { y: scroll.current / (canvas.sizes.ratioY) })

  const wrapperBounds = galleryWrapper.getBoundingClientRect()
  const firstElementBounds = medias[0].element.getBoundingClientRect()
  scroll.offsetY = ((wrapperBounds.top + (firstElementBounds.height / 2)) / window.innerHeight) * canvas.sizes.height

  const threshold = canvas.sizes.height / 2 - scroll.offsetY

  const index = medias.reduce((closestIndex, media, i) => {
    const current = Math.abs(medias[closestIndex].mesh.position.y - threshold)
    const next = Math.abs(media.mesh.position.y - threshold)
    return next < current ? i : closestIndex
  }, 0)

  if (index !== currentProjectIndex) {
    SWITCH_PROJECT_INDEX(currentProjectIndex, index, scroll.direction)
    currentProjectIndex = index
  }

  scroll.last = scroll.current
}

export function cleanup() {
  offInit()
  offScroll()
  offResize()
  offUpdate()
  isTransitioning = false
  medias.forEach(m => m.destroy())
  group.setParent(null)
  onResize()
}
