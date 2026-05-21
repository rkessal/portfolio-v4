import gsap from "gsap";

export async function defaultTransition(currentContainer, nextContainer) {
  gsap.set(nextContainer, {
    clipPath: 'inset(100% 0% 0% 0%)',
    opacity: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    zIndex: 10,
    willChange: 'transform, clip-path'
  })

  const tl = gsap.timeline()

  tl.to(currentContainer, {
    y: '-30vh',
    opacity: 0.6,
    force3D: true,
    duration: 1,
    scale: 0.8,
    ease: 'power2.inOut'
  }, 0).to(nextContainer, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 1,
    force3D: true,
    ease: 'power2.inOut'
  }, 0)

  return tl
}