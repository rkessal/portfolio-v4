import ENTER from "../../animations/enter"
import template from "./home.html?raw"
import * as pageCanvas from '../../canvas/home'
import { MAIN } from "../../animations/home/main"

export default function HomePage() {
  return template
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

export function cleanup(currentNamespace) {
  pageCanvas.cleanup(currentNamespace)
}