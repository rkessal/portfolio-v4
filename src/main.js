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
const srcs = Object.values(images).map(src => String(src).replace('/public', '').replace('/assets', '')).map(src => `${url.origin}${src}`)
console.log(srcs)

await lenis.init()
await canvas.init()
await canvas.preload(srcs)
console.log(canvas.textureCache)
await router.init()