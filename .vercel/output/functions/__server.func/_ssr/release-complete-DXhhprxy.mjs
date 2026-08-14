//#region node_modules/.nitro/vite/services/ssr/assets/release-complete-DXhhprxy.js
/**
* Propagates a completed release back onto its source entity so the
* handover workflow stays consistent across the two demo stores.
* DEMO ONLY — the real backend would do this in one transaction.
*/
function completeReleaseSource(updateOrderStatus, setBuildStatus, setServiceStatus, kind, refId) {
	if (kind === "build") setBuildStatus(refId, "released");
	else if (kind === "service") setServiceStatus(refId, "released");
	else updateOrderStatus(refId, "completed");
}
//#endregion
export { completeReleaseSource as t };
