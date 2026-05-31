import juri from "./juri.html?raw"
import limeears from "./limeears.html?raw"
import gilbalfas from "./gilbalfas.html?raw"
import kyoto from "./kyoto.html?raw"
import notFound from '../not-found/not-found.html?raw'
import ENTER from "../../animations/projects/enter"
import * as pageCanvas from '../../canvas/project'


const pages = { juri, limeears, gilbalfas, kyoto }

export default function Project({ params }) {
  return pages[params.id] ?? notFound
}

export function init({ container, transition }) {
  if (!transition) {
    ENTER(container, 0.65)
  }
  pageCanvas.default()
}

export function getCanvas() {
  return pageCanvas
}

export function cleanup() {
  pageCanvas.cleanup()
}