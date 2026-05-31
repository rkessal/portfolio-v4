import gsap from "gsap"

export const SWITCH_PROJECT_INDEX = (currentIndex, newIndex, direction) => {
  if (currentIndex === newIndex) {
    return
  }

  const tl = gsap.timeline()
  tl.to(`.home__projects__list li`, {
    yPercent: newIndex * -100,
    duration: 0.8,
    ease: 'expo.out'
  })
}