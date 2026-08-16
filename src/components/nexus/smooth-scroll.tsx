import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/motion";

/**
 * Global smooth scrolling via Lenis, driven by gsap's ticker so ScrollTrigger
 * (Reveal, ScrollProgress) stays perfectly in sync on the same rAF loop.
 * Lenis honors `prefers-reduced-motion` via its `respectReducedMotion` option.
 *
 * NOTE: the setup intentionally lives inside a component effect, NOT at module
 * scope — the project's `sideEffects: false` can strip src/ module-level side
 * effects from the production client bundle (the same trap that broke gsap's
 * ScrollTrigger registration). Effect bodies always survive bundling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: true,
      allowNestedScroll: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const g = window as Window & { __lenis?: Lenis };
    g.__lenis = lenis;

    return () => {
      if (g.__lenis === lenis) delete g.__lenis;
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
