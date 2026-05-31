import gsap from "gsap"
import { defaultTransition } from "./animations/defaultTransition"
import { homeProjectTransition, projectHomeTransition } from "./animations/homeProjectTransition"
import { canvas } from "../canvas"
import { router } from "../router"
import { projectLeftTransition } from "./animations/projectProjectTransition"

const transitions = {
  'home->about': defaultTransition,
  'about->home': defaultTransition,
  'home->project': homeProjectTransition,
  'project->home': projectHomeTransition,
  'project->project': projectLeftTransition
}

export async function executeTransition({ nextHTML, nextNamespace, nextModule, currentModule, params }) {
  const currentContainer = document.querySelector('[data-transition="container"]')
  const wrapper = document.querySelector('[data-transition="wrapper"')
  const currentNamespace = currentContainer.getAttribute('data-namespace')

  const snapshot = {
    cleanup: currentModule?.cleanup?.bind({}),
    canvas: currentModule?.getCanvas?.()
  }

  const nextContainer = currentContainer.cloneNode(false)
  nextContainer.setAttribute('data-namespace', nextNamespace)
  const content = document.createElement('main')
  content.id = 'page_content'
  content.className = 'page_content'
  content.innerHTML = nextHTML
  nextContainer.appendChild(content)
  wrapper.appendChild(nextContainer)

  if (nextModule?.init) {
    await nextModule.init({ container: nextContainer, transition: true })
  }

  const transition = getTransition(currentNamespace, nextNamespace)
  const timeline = transition(currentContainer, nextContainer, snapshot.canvas, params)
  await timeline.then()

  snapshot.cleanup?.()
  console.log('vai emitir transition')
  canvas.emit('init', {
    previousNamespace: currentNamespace,
    namespace: nextNamespace,
    params,
  })

  window.scrollTo({ top: 0 })
  currentContainer.remove()
  gsap.set(nextContainer, { clearProps: true })
  gsap.set(nextContainer, { force3D: true })
}

function getTransition(currentNamespace, nextNamespace) {
  return transitions[`${currentNamespace}->${nextNamespace}`] ?? defaultTransition
}