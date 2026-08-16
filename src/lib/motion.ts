import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register unconditionally at module scope. The plugin's own auto-registration
// only triggers when `window.gsap` exists (CDN-style), so with bundled ESM we
// must register explicitly — and doing it inside a `typeof window` guard gets
// tree-shaken out of the production client bundle. gsap is SSR-safe here.
//
// NOTE: Rollup can drop this whole module from the client build when the
// project's treeshake config treats local re-export modules as side-effect-free
// (it happens: the registerPlugin call never lands in the client chunk). The
// registration is therefore ALSO performed inside the useGSAP callbacks in
// src/components/nexus/motion.tsx, which are guaranteed to survive bundling.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
