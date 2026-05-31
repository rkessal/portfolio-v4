import gsap from "gsap"

export const MAIN = () => {
  gsap.set('.home__projects__list li:not(:nth-child(1))', {
    autoAlpha: 0
  })

  gsap.from('.home__projects__list li:nth-child(1)', {
    autoAlpha: 0,
    yPercent: 100,
  })
}