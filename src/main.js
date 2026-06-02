import './style.css'
import { router } from './router'
import { canvas } from './canvas'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'
import { lenis } from './lenis'

gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollTrigger)

const images = import.meta.glob('/**/*.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' })
const url = new URL(window.location.href)
const textures = Object.entries(images).map(([path, url]) => ({
  key: path.replace('/public', '').replace('/assets', ''),
  url: url
}))

console.log(textures)

await lenis.init()
await canvas.init()
await canvas.preload(textures)
console.log(canvas.textureCache)
await router.init()