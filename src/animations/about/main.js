import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"


let sc = []
let st = []

const MAIN = ({ container, delay, transition }) => {
  setTimeout(() => {

    const t = container.querySelectorAll(`${transition ? '' : '.about__title, .about__description p, .about__break__1 span,'} .about__awards span, .about__socials span, .about__awards__line p, .about__awards__line span, .about__socials__platform li`)

    st = SplitText.create(t, {
      type: "lines, words",
      mask: "lines",
      linesClass: 'line-transition',
      autoSplit: true,
    })

    gsap.set('.line-transition', {
      yPercent: 100,
      autoAlpha: 0,
    })

    sc = ScrollTrigger.batch('.line-transition', {
      onEnter: batch => {
        gsap.to(batch, {
          duration: 1.5,
          force3D: true,
          ease: 'expo.out',
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.05,
        })
      },
    })
  }, delay * 1000)

  return () => {
    sc.forEach(t => t.kill())
  }
}

export default MAIN