import gsap from "gsap";
import { canvas } from "../../canvas";
import ENTER from "../../animations/projects/enter";
import { router } from "../../router";

export async function homeProjectTransition(currentContainer, nextContainer, currentCanvas, params) {
  let medias = []
  if (currentCanvas) {
    medias = currentCanvas.getState().medias
    currentCanvas.onTransition()
  }

  const currentMedia = medias.find(media => {
    const link = media.element.closest('a')
    const path = new URL(link.href).pathname
    const currentPath = window.location.pathname

    return path === currentPath
  })

  const mainImage = nextContainer.querySelector('.project__main-image')

  gsap.set(nextContainer, {
    clipPath: 'inset(0% 0% 100% 0%)',
    opacity: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    willChange: 'transform, clip-path, scale'
  })

  const tl = gsap.timeline()

  tl.to('.nav', {
    autoAlpha: 0,
    yPercent: -100,
  })
  tl.to(currentContainer, {
    autoAlpha: 0.6,
    force3D: true,
    duration: 1.6,
    ease: 'power2.inOut',
  }, 0)
  tl.to('.home__projects__left', {
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power2.inOut',
  }, 0)

  medias.filter(media => media !== currentMedia).forEach(media => {
    media.mesh.position.z = 0.00001
    tl.to(media.program.uniforms.uAlpha, {
      value: 0,
    }, 0)
  })

  const bounds = mainImage.getBoundingClientRect()
  currentMedia.transitionToProject(tl, bounds)

  tl.to(nextContainer, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 0.6,
    force3D: true,
    ease: 'power2.inOut'
  }, '>')

  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`, {
      currentMedia,
      params,
    })
  })

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')


  ENTER(nextContainer, 2)

  return tl
}

export async function projectHomeTransition(currentContainer, nextContainer, currentCanvas) {
  let medias = []
  if (currentCanvas) {
    medias = currentCanvas.getState().medias
    currentCanvas.onTransition()
  }

  gsap.set(nextContainer, {
    clipPath: 'inset(100% 0% 0% 0%)',
    opacity: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    willChange: 'transform, clip-path, scale'
  })


  const tl = gsap.timeline()

  medias.forEach(media => {
    tl.to(media.program.uniforms.uAlpha, {
      value: 0,
    }, 0)
  })

  gsap.set('.home__projects__left', {
    autoAlpha: 0
  })

  tl.to('.home__projects__left', {
    autoAlpha: 1
  }, '>')

  tl.to('.project__nav', {
    yPercent: -100,
    autoAlpha: 0
  }, 0)
  tl.to('.project__link', {
    yPercent: 100,
    autoAlpha: 0,
  }, 0)

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')


  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`)
  }, 0)

  tl.to('.nav', {
    autoAlpha: 1,
    yPercent: 0
  }, '>')


  tl.to('.line', {
    duration: 1.5,
    force3D: true,
    ease: 'expo.out',
    yPercent: -100,
    autoAlpha: 0,
  }, 0)

  tl.to(currentContainer, {
    autoAlpha: 0.6,
    force3D: true,
    duration: 0.6,
    ease: 'power2.inOut',
  }, 0).to(nextContainer, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 0.6,
    ease: 'power2.inOut',
    force3D: true,
  }, 0)

  return tl
}