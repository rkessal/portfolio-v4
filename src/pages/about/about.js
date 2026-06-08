import MAIN from "../../animations/about/main"
import { canvas } from "../../canvas"
import { createAboutCanvas } from "../../canvas/about"
import template from "./about.html?raw"

let instance = null
let offMain = null
let offWebglDisabled = null

export default function AboutPage() {
  return template
}

export function init({ container, transition }) {

  offMain = MAIN({ container, transition, delay: transition ? 0.5 : 0 })

  if (!canvas.isMobile()) {
    instance = createAboutCanvas()
  }

  offWebglDisabled = canvas.on('webgl-disabled', () => {
    instance?.cleanup()
    instance = null
  })
}

export function getCanvas() {
  return instance
}

export function cleanup() {
  offMain?.()
  offWebglDisabled?.()
}