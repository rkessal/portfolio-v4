import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

class LenisLib {
  constructor() {
    this.lenis = null
  }

  init() {
    this.lenis = new Lenis({
      autoRaf: true,
      lerp: 0.05,
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    // gsap.ticker.lagSmoothing(0);
  }

}

export const lenis = new LenisLib()