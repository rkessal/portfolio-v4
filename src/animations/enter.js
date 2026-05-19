import gsap from "gsap"

const ENTER = (nextContainer, delay) => {
  const t = nextContainer?.querySelector('h1')

  if (!t) return null

  gsap.set(t, { y: '100%' })

  const tl = gsap.timeline({
    delay
  })

  tl.to(t, {
    y: 0,
    duration: 1,
    force3D: true,
    ease: 'expo.out'
  }, 0)

  return { timeline: tl }
}

export default ENTER