import ENTER from "../../animations/enter"
import template from "./home.html?raw"
import { MAIN } from "../../animations/home/main"
import { createHomeCanvas } from "../../canvas/home"

let instance = null

export default function HomePage() {
  return template
}

export function init({ container, params, transition }) {
  instance = createHomeCanvas()
}

export function getCanvas() {
  return instance
}

export function cleanup() {
}