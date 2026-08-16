import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-triggered fade-up reveal. When `stagger` is set, each direct child is
 * revealed in sequence. SSR-safe: children render normally, animation is added
 * client-side only. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 16,
  delay = 0,
  duration = 0.55,
  stagger = 0,
  start = "top 88%",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      // ScrollTrigger must be registered before any tween that uses
      // `scrollTrigger`. lib/motion.ts also registers it, but the client
      // tree-shaker can drop that module's side effects in production, so we
      // register here too (idempotent).
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const targets: gsap.TweenTarget[] =
        stagger > 0 ? Array.from(el.children) : [el];
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [] },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Thin scroll-progress bar fixed to the top edge of the viewport. */
export function ScrollProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const el = ref.current;
      if (!el || reducedMotion()) return;
      gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
      const st = ScrollTrigger.create({
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
      });
      return () => {
        st.kill();
      };
    },
    { scope: ref, dependencies: [] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-info via-info to-success",
        className,
      )}
    />
  );
}
