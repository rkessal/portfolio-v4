import MAIN from "../../animations/about/main"
import { createAboutCanvas } from "../../canvas/about"
import template from "./about.html?raw"

let instance = null
let offMain = null

export default function AboutPage() {
  return template
}

export function init({ container, transition }) {
  instance = createAboutCanvas()
  offMain = MAIN({ container, transition, delay: transition ? 0.5 : 0 })
}

export function getCanvas() {
  return instance
}

export function cleanup() {
  offMain?.()
}