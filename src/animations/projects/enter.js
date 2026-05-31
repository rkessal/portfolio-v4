import gsap from "gsap"
import { SplitText } from "gsap/SplitText";

const ENTER = (nextContainer, delay) => {
  const t = nextContainer?.querySelectorAll('.project__details__description, .project__details__table__line p')

  if (!t) return null

  const tl = gsap.timeline({ delay })

  gsap.to('.nav', {
    autoAlpha: 0
  })

  tl.from('.project__link', {
    autoAlpha: 0,
    yPercent: 100
  }, 0)

  tl.from('.project__nav', {
    autoAlpha: 0,
    yPercent: -100
  }, 0)

  SplitText.create(t, {
    type: "lines, words",
    mask: "lines",
    linesClass: 'line',
    autoSplit: true,
    onSplit(self) {
      return tl.from(self.lines, {
        duration: 1.5,
        force3D: true,
        ease: 'expo.out',
        y: 100,
        autoAlpha: 0,
        stagger: 0.05
      }, 0);
    }
  });
}

export default ENTER