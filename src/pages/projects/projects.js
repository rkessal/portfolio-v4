import juri from "./juri.html?raw"
import limeears from "./limeears.html?raw"
import gilbalfas from "./gilbalfas.html?raw"
import kyoto from "./kyoto.html?raw"
import notFound from '../not-found/not-found.html?raw'
import ENTER from "../../animations/projects/enter"
import { createProjectCanvas } from "../../canvas/project"
import { canvas } from "../../canvas"


const pages = { juri, limeears, gilbalfas, kyoto }

let instance = null
let offWebglDisabled = null

export default function Project({ params }) {
  return pages[params.id] ?? notFound
}

export function init({ container, params, transition }) {
  if (!transition) {
    ENTER(container)
  }

  if (!canvas.isMobile()) {
    instance = createProjectCanvas()
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