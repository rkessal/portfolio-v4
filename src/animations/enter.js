import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

const ENTER = (nextContainer, delay) => {
  const t = nextContainer?.querySelectorAll('.home__projects__title, .home__projects__list li')

  if (!t) return null


  const tl = gsap.timeline({
    delay
  })

  SplitText.create(t, {
    type: "lines, words",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.words, {
        duration: 1.5,
        force3D: true,
        ease: 'expo.out',
        y: 100,
        autoAlpha: 0,
        stagger: 0.05
      });
    }
  });

  return { timeline: tl }
}

export default ENTER