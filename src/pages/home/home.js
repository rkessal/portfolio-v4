import ENTER from "../../animations/enter"
import template from "./home.html?raw"

export default function HomePage() {
  return template
}

export function init({ container }) {
  ENTER(container, 0.65)
}

export function cleanup() { }