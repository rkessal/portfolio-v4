import ENTER from "../../animations/enter"
import template from "./alternative-page.html?raw"

export default function AlternativePage() {
  return template
}

export function init({ container }) {
  ENTER(container, 0.65)
}

export function cleanup() { }