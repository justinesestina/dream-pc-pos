//#region node_modules/.nitro/vite/services/ssr/assets/permissions-DN7TKSNU.js
var matrix = {
	owner: [
		"pos",
		"orders",
		"quotes",
		"customers",
		"products",
		"inventory",
		"inventory.adjust",
		"builds",
		"builds.qa",
		"assembly",
		"services",
		"warranty",
		"reports",
		"settings",
		"costs",
		"purchasing",
		"receiving",
		"returns",
		"shifts",
		"consultations",
		"tasks",
		"staff",
		"audit",
		"releases",
		"documents"
	],
	admin: [
		"pos",
		"orders",
		"quotes",
		"customers",
		"products",
		"inventory",
		"inventory.adjust",
		"builds",
		"builds.qa",
		"assembly",
		"services",
		"warranty",
		"reports",
		"settings",
		"costs",
		"purchasing",
		"receiving",
		"returns",
		"shifts",
		"consultations",
		"tasks",
		"staff",
		"releases",
		"documents"
	],
	cashier: [
		"pos",
		"orders",
		"quotes",
		"customers",
		"products",
		"returns",
		"shifts",
		"consultations",
		"tasks",
		"documents",
		"releases"
	],
	technician: [
		"builds",
		"builds.qa",
		"assembly",
		"services",
		"products",
		"inventory",
		"warranty",
		"orders",
		"tasks",
		"staff",
		"releases",
		"consultations"
	],
	inventory: [
		"products",
		"inventory",
		"inventory.adjust",
		"orders",
		"purchasing",
		"receiving",
		"returns",
		"tasks",
		"documents"
	]
};
function can(role, cap) {
	return (matrix[role] ?? []).includes(cap);
}
/** Landing page after sign-in — where each role actually works. */
function homeFor(role) {
	if (role === "cashier") return "/pos";
	if (role === "inventory") return "/inventory";
	return "/dashboard";
}
/**
* Maps a URL path to the capability it belongs to, so direct URL access can be
* checked against the signed-in role. Longest prefixes first; dynamic segments
* (e.g. /builds/BLD-1001) match their section.
*/
var PATH_CAPS = [
	[/^\/dashboard/, "orders"],
	[/^\/pos/, "pos"],
	[/^\/orders/, "orders"],
	[/^\/quotes/, "quotes"],
	[/^\/consultations/, "consultations"],
	[/^\/returns/, "returns"],
	[/^\/shifts/, "shifts"],
	[/^\/products/, "products"],
	[/^\/inventory/, "inventory"],
	[/^\/serials/, "inventory"],
	[/^\/builds/, "builds"],
	[/^\/assembly/, "assembly"],
	[/^\/purchasing/, "purchasing"],
	[/^\/suppliers/, "purchasing"],
	[/^\/receiving/, "receiving"],
	[/^\/customers/, "customers"],
	[/^\/services/, "services"],
	[/^\/warranty/, "warranty"],
	[/^\/releases/, "releases"],
	[/^\/tasks/, "tasks"],
	[/^\/staff/, "staff"],
	[/^\/documents/, "documents"],
	[/^\/reports/, "reports"],
	[/^\/settings/, "settings"],
	[/^\/audit/, "audit"]
];
/** Returns the capability required to open a path, or null for unrestricted paths. */
function capForPath(pathname) {
	for (const [re, cap] of PATH_CAPS) if (re.test(pathname)) return cap;
	return null;
}
var roleLabels = {
	owner: "Owner",
	admin: "Admin",
	cashier: "Cashier",
	technician: "Technician",
	inventory: "Inventory Staff"
};
//#endregion
export { roleLabels as i, capForPath as n, homeFor as r, can as t };
