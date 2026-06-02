import gsap from "gsap"
import { defaultTransition } from "./animations/defaultTransition"
import { homeProjectTransition, projectHomeTransition } from "./animations/homeTransition"
import { canvas } from "../canvas"
import { router } from "../router"
import { projectLeftTransition } from "./animations/projectTransition"
import { aboutHomeTransition, homeAboutTransition } from "./animations/aboutTransition"

const transitions = {
  'home->project': homeProjectTransition,
  'project->home': projectHomeTransition,
  'project->project': projectLeftTransition,
  'home->about': homeAboutTransition,
  'about->home': aboutHomeTransition,
}

export async function executeTransition({ nextHTML, nextNamespace, nextModule, currentModule, params }) {
  const currentContainer = document.querySelector('[data-transition="container"]')
  const wrapper = document.querySelector('[data-transition="wrapper"')
  const currentNamespace = currentContainer.getAttribute('data-namespace')

  const currentCanvas = currentModule.getCanvas()
  currentCanvas.onTransition()

  const nextContainer = currentContainer.cloneNode(false)
  nextContainer.setAttribute('data-namespace', nextNamespace)
  const content = document.createElement('main')
  content.id = 'page_content'
  content.className = 'page_content'
  content.innerHTML = nextHTML
  nextContainer.appendChild(content)
  wrapper.appendChild(nextContainer)


  if (nextModule?.init) {
    await nextModule.init({ container: nextContainer, params, transition: true })
  }

  const transition = getTransition(currentNamespace, nextNamespace)
  const timeline = transition(currentContainer, nextContainer, currentCanvas, params)
  await timeline.then()

  canvas.emit('init', {
    previousNamespace: currentNamespace,
    namespace: nextNamespace,
    params,
  })

  currentCanvas.cleanup()
  currentModule.cleanup()

  window.scrollTo({ top: 0 })
  currentContainer.remove()
  gsap.set(nextContainer, { clearProps: true })
  gsap.set(nextContainer, { force3D: true })
}

function getTransition(currentNamespace, nextNamespace) {
  return transitions[`${currentNamespace}->${nextNamespace}`] ?? defaultTransition
}