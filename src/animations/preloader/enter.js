import gsap from "gsap"

const PRELOADER = (percent) => {
  gsap.to('.preloader .nav__logo', {
    opacity: percent / 100
  })
}

export default PRELOADER