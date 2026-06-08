import ENTER from "../../animations/enter"
import template from "./home.html?raw"
import { MAIN } from "../../animations/home/main"
import { createHomeCanvas } from "../../canvas/home"
import { canvas } from "../../canvas"

let instance = null
let offWebglDisabled = null

export default function HomePage() {
  return template
}

export function init({ container, params, transition }) {
  if (!transition) {
    ENTER(container)
  }

  if (!canvas.isMobile()) {
    instance = createHomeCanvas()
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
  offWebglDisabled?.()
}