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

const images = import.meta.glob('/src/assets/**/*.{webp,jpg,png}', { eager: true, import: 'default' })
const url = new URL(window.location.href)
const srcs = Object.values(images).map(src => src.replace('/public', '')).map(src => `${url.origin}${src}`)

await lenis.init()
await canvas.init()
await canvas.preload(srcs)
await router.init()