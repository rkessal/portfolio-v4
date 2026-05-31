import './style.css'
import { router } from './router'
import { canvas } from './canvas'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

gsap.from('.nav', {
  autoAlpha: 0,
  yPercent: -100
})

const images = import.meta.glob('/public/**/*.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' })
const url = new URL(window.location.href)
const srcs = Object.values(images).map(src => src.replace('/public', '')).map(src => `${url.origin}${src}`)

await canvas.init()
await canvas.preload(srcs)
await router.init()
