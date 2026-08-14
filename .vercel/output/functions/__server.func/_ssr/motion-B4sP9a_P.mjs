import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { L as cn } from "./router-DXywCOrU.mjs";
import { n as gsapWithCSS, t as useGSAP } from "../_libs/gsap+gsap__react.mjs";
import { t as ScrollTrigger } from "../_libs/gsap.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/motion-B4sP9a_P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/**
* Scroll-triggered fade-up reveal. When `stagger` is set, each direct child is
* revealed in sequence. SSR-safe: children render normally, animation is added
* client-side only. Respects prefers-reduced-motion.
*/
function Reveal({ children, className, as: Tag = "div", y = 16, delay = 0, duration = .55, stagger = 0, start = "top 88%" }) {
	const ref = (0, import_react.useRef)(null);
	useGSAP(() => {
		const el = ref.current;
		if (!el || reducedMotion()) return;
		const targets = stagger > 0 ? Array.from(el.children) : [el];
		gsapWithCSS.fromTo(targets, {
			autoAlpha: 0,
			y
		}, {
			autoAlpha: 1,
			y: 0,
			duration,
			delay,
			ease: "power3.out",
			stagger,
			scrollTrigger: {
				trigger: el,
				start,
				once: true
			}
		});
	}, {
		scope: ref,
		dependencies: []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
		ref,
		className,
		children
	});
}
/** Thin scroll-progress bar fixed to the top edge of the viewport. */
function ScrollProgress({ className }) {
	const ref = (0, import_react.useRef)(null);
	useGSAP(() => {
		const el = ref.current;
		if (!el || reducedMotion()) return;
		gsapWithCSS.set(el, {
			scaleX: 0,
			transformOrigin: "left center"
		});
		const st = ScrollTrigger.create({
			start: 0,
			end: () => ScrollTrigger.maxScroll(window),
			onUpdate: (self) => gsapWithCSS.set(el, { scaleX: self.progress })
		});
		return () => {
			st.kill();
		};
	}, {
		scope: ref,
		dependencies: []
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"aria-hidden": true,
		className: cn("pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-info via-info to-success", className)
	});
}
//#endregion
export { ScrollProgress as n, Reveal as t };
