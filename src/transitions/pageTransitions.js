import gsap from "gsap"
import { defaultTransition } from "./animations/defaultTransition"

export async function executeTransition({ nextHTML, nextNamespace, nextModule }) {
  const currentContainer = document.querySelector('[data-transition="container"]')
  const wrapper = document.querySelector('[data-transition="wrapper"')

  const nextContainer = currentContainer.cloneNode(false)
  nextContainer.setAttribute('data-namespace', nextNamespace)


  const content = document.createElement('main')
  content.id = 'page_content'
  content.className = 'page_content'
  content.innerHTML = nextHTML
  nextContainer.appendChild(content)

  wrapper.appendChild(nextContainer)

  if (nextModule?.init) {
    nextModule.init({ container: nextContainer })
  }

  const timeline = defaultTransition(currentContainer, nextContainer)

  await timeline.then()

  currentContainer.remove()
  gsap.set(nextContainer, { clearProps: true })
  gsap.set(nextContainer, { force3D: true })
}