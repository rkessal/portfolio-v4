import gsap from "gsap";
import { canvas } from "../../canvas";
import ENTER from "../../animations/projects/enter";
import { router } from "../../router";
import { SplitText } from "gsap/SplitText";

export async function projectLeftTransition(currentContainer, nextContainer, currentCanvas, params) {
  const t = nextContainer?.querySelectorAll('.project__details__description, .project__details__table__line p, .project__next-project__bottom div')
  const { medias } = currentCanvas.getState()

  gsap.set(nextContainer, {
    opacity: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    willChange: 'transform, clip-path, scale',
    zIndex: 9,
  })

  gsap.set(currentContainer, {
    opacity: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: '100vh',
    zIndex: 10
  })

  const tl = gsap.timeline()

  medias.forEach(media => {
    tl.to(media.program.uniforms.uAlpha, {
      value: 0,
    }, 0)
  })
  console.log('hello')

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')

  console.log('vai emitir custom')

  tl.to('.line', {
    duration: 1.5,
    force3D: true,
    ease: 'expo.out',
    yPercent: -100,
    autoAlpha: 0,
    stagger: 0.05
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

  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`, {
      currentMedia: medias[medias.length - 1],
      params,
    })
  })

  return tl

}
