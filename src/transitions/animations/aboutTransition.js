import gsap from "gsap";
import { canvas } from "../../canvas";
import ENTER from "../../animations/projects/enter";
import { router } from "../../router";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export async function homeAboutTransition(currentContainer, nextContainer, currentCanvas, params) {
  const t = nextContainer?.querySelectorAll('.about__title, .about__description p, .about__break__1 span, .about__awards__line p, .about__awards__line span, .about__socials__platform li')
  const { medias } = currentCanvas.getState()

  currentCanvas.onTransition()

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

  medias.forEach(media => {
    media.mesh.position.z = 0.0001
    tl.to(media.program.uniforms.uAlpha, {
      value: 0,
      duration: 1.5,
      ease: 'expo.in',
    }, 0)
      .to(media.program.uniforms.uProgress, {
        value: 0,
        duration: 1.5,
        ease: 'expo.in',
      }, 0)
      .to(media.program.uniforms.uStrength, {
        value: 0.025,
        duration: 1.5,
        ease: 'expo.in',
      }, 0)
  })

  tl.to('.home__projects__left', {
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power2.inOut',
  }, 0)

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')


  tl.to(nextContainer, {
    opacity: 1,
  })

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

  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`)
  }, '<')

  return tl

}


export async function aboutHomeTransition(currentContainer, nextContainer, currentCanvas) {
  const t = currentContainer?.querySelectorAll('.line, .line-transition')
  const { medias } = currentCanvas.getState()

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

  currentCanvas.onTransition()

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

  tl.to(['.line', '.line-transition'], {
    duration: 1.5,
    force3D: true,
    ease: 'expo.out',
    yPercent: -100,
    autoAlpha: 0,
  }, 0)

  const currentNamespace = currentContainer.getAttribute('data-namespace')
  const nextNamespace = nextContainer.getAttribute('data-namespace')


  tl.to(currentContainer, {
    autoAlpha: 0.6,
    force3D: true,
    duration: 0.6,
    ease: 'power2.inOut',
  }, '<').to(nextContainer, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 0.6,
    ease: 'power2.inOut',
    force3D: true,
  }, '<')

  tl.to(currentContainer, {
    onStart: () => canvas.emit(`transition-${currentNamespace}->${nextNamespace}`)
  }, '<')

  return tl
}
