import gsap from "gsap";
import { canvas } from "../../canvas";
import ENTER from "../../animations/projects/enter";
import { router } from "../../router";
import { SplitText } from "gsap/SplitText";

export async function projectLeftTransition(currentContainer, nextContainer, currentCanvas, params) {
  const t = nextContainer?.querySelectorAll('.project__details__description, .project__details__table__line p')

  let medias = []
  if (currentCanvas) {
    medias = currentCanvas.getState().medias
    currentCanvas.onTransition()
  }


  gsap.set(nextContainer, {
    opacity: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    willChange: 'transform, clip-path, scale',
  })

  const tl = gsap.timeline()

  const currentMedia = medias[medias.length - 1]

  medias.filter(media => media !== currentMedia).forEach(media => {
    media.mesh.position.z = 0.0001
    tl.to(media.program.uniforms.uAlpha, {
      value: 0,
    }, 0)
  })

  const mainImage = nextContainer.querySelector('.project__main-image img')
  const bounds = mainImage.getBoundingClientRect()

  const currentBottom = currentContainer.querySelector('.project__next-project__bottom')
  tl.to(currentBottom, {
    delay: 0.5,
    autoAlpha: 0,
    yPercent: -100
  }, 0)

  if (currentMedia) {
    currentMedia.transitionToProject(tl, bounds)
  }

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')

  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`, {
      currentMedia: medias[medias.length - 1],
      params,
    })
  })

  const currentNav = currentContainer.querySelectorAll('.project__nav')
  const currentLink = currentContainer.querySelectorAll('.project__link')

  const nextNav = nextContainer.querySelectorAll('.project__nav')
  const nextLink = nextContainer.querySelectorAll('.project__link')


  tl.to(currentLink, {
    autoAlpha: 0,
    yPercent: 100
  }, 0)

  tl.to(currentNav, {
    autoAlpha: 0,
    yPercent: -100
  }, 0)


  tl.to(nextContainer, {
    opacity: 1,
  })

  tl.from(nextLink, {
    autoAlpha: 0,
    yPercent: 100
  },)

  tl.from(nextNav, {
    autoAlpha: 0,
    yPercent: -100
  }, '<')

  tl.to('.line', {
    duration: 1.5,
    force3D: true,
    ease: 'expo.out',
    yPercent: -100,
    autoAlpha: 0,
    stagger: 0.05
  }, '<')


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
      }, '<');
    }
  });

  return tl

}
