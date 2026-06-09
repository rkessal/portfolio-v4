import './style.css'
import { router } from './router'
import { canvas } from './canvas'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'
import { lenis } from './lenis'
import PRELOADER from './animations/preloader/enter'

gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollTrigger)

const images = import.meta.glob('/**/*.{webp,jpg,png}', { eager: true, query: '?url', import: 'default' })
const url = new URL(window.location.href)
const textures = Object.entries(images).map(([path, url]) => ({
  key: path.replace('/public', '').replace('/assets', ''),
  url: url
}))

await lenis.init()
await canvas.init()

const preloaderNumber = document.querySelector('.preloader__number')

const tl = gsap.timeline()

await canvas.preload(textures, (progress, loaded, total) => {
  const percent = Math.round(progress * 100)
  preloaderNumber.textContent = `${percent}%`
  PRELOADER(percent)

  if (percent === 100) {
    tl.to('.preloader__separator', {
      scaleY: percent / 100,
      duration: 1.5,
      ease: 'power4.inOut'
    })

    tl.to('.preloader', {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1.5,
      ease: 'expo.out'
    })
  }
})
await router.init()