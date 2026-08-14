import { i as __toESM } from "../_runtime.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-D3h_gn47.js
var now$1 = Date.now();
var daysAgo$1 = (d, h = 10) => {
	const x = /* @__PURE__ */ new Date(now$1 - d * 864e5);
	x.setHours(h, d * 7 % 60, 0, 0);
	return x.toISOString();
};
var daysAhead$1 = (d) => new Date(now$1 + d * 864e5).toISOString();
var demoUsers = [
	{
		id: "u-1",
		name: "Justine Ramos",
		email: "demo@dpcnexus.local",
		role: "owner",
		initials: "JR",
		password: "demo1234"
	},
	{
		id: "u-2",
		name: "Mika Santos",
		email: "admin@dpcnexus.local",
		role: "admin",
		initials: "MS",
		password: "admin1234"
	},
	{
		id: "u-3",
		name: "Paolo Cruz",
		email: "cashier@dpcnexus.local",
		role: "cashier",
		initials: "PC",
		password: "cashier1234"
	},
	{
		id: "u-4",
		name: "Ken Villareal",
		email: "tech@dpcnexus.local",
		role: "technician",
		initials: "KV",
		password: "tech1234"
	},
	{
		id: "u-5",
		name: "Dana Lim",
		email: "stock@dpcnexus.local",
		role: "inventory",
		initials: "DL",
		password: "stock1234"
	}
];
var categories = [
	{
		id: "cat-cpu",
		name: "CPU",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "cpu"
	},
	{
		id: "cat-gpu",
		name: "GPU",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "gpu"
	},
	{
		id: "cat-motherboard",
		name: "Motherboard",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "motherboard"
	},
	{
		id: "cat-ram",
		name: "RAM",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "ram"
	},
	{
		id: "cat-storage",
		name: "Storage",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "storage"
	},
	{
		id: "cat-psu",
		name: "PSU",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "psu"
	},
	{
		id: "cat-case",
		name: "Case",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "case"
	},
	{
		id: "cat-cooling",
		name: "Cooling",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "cooling"
	},
	{
		id: "cat-fans",
		name: "Fans",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "fans"
	},
	{
		id: "cat-monitor",
		name: "Monitor",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	},
	{
		id: "cat-keyboard",
		name: "Keyboard",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	},
	{
		id: "cat-mouse",
		name: "Mouse",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	},
	{
		id: "cat-headset",
		name: "Headset",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	},
	{
		id: "cat-networking",
		name: "Networking",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	},
	{
		id: "cat-accessories",
		name: "Accessories",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "accessories"
	},
	{
		id: "cat-software",
		name: "Software",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z",
		key: "software"
	},
	{
		id: "cat-services",
		name: "Services",
		archived: false,
		createdAt: "2025-01-10T09:00:00.000Z"
	}
];
var products = [
	{
		id: "p-cpu-7800x3d",
		sku: "CPU-AMD-7800X3D",
		name: "AMD Ryzen 7 7800X3D",
		brand: "AMD",
		categoryId: "cat-cpu",
		price: 21500,
		cost: 18200,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A1-01",
		supplier: "Nexlogic Distribution",
		specs: {
			socket: "AM5",
			tdp: 120,
			cores: 8
		}
	},
	{
		id: "p-cpu-7600",
		sku: "CPU-AMD-7600",
		name: "AMD Ryzen 5 7600",
		brand: "AMD",
		categoryId: "cat-cpu",
		price: 11250,
		cost: 9600,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A1-02",
		supplier: "Nexlogic Distribution",
		specs: {
			socket: "AM5",
			tdp: 65,
			cores: 6
		}
	},
	{
		id: "p-cpu-14600kf",
		sku: "CPU-INT-14600KF",
		name: "Intel Core i5-14600KF",
		brand: "Intel",
		categoryId: "cat-cpu",
		price: 15400,
		cost: 13100,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A1-03",
		supplier: "Silicon Bay Trading",
		specs: {
			socket: "LGA1700",
			tdp: 125,
			cores: 14
		}
	},
	{
		id: "p-gpu-5070",
		sku: "GPU-RTX5070",
		name: "RTX 5070 Gaming OC 12GB",
		brand: "Gigabyte",
		categoryId: "cat-gpu",
		price: 42500,
		cost: 37800,
		serialTracked: true,
		warrantyMonths: 36,
		location: "B2-01",
		supplier: "Nexlogic Distribution",
		specs: {
			tdp: 250,
			length: "302mm"
		}
	},
	{
		id: "p-gpu-5060ti",
		sku: "GPU-RTX5060TI",
		name: "RTX 5060 Ti Ventus 16GB",
		brand: "MSI",
		categoryId: "cat-gpu",
		price: 28900,
		cost: 25400,
		serialTracked: true,
		warrantyMonths: 36,
		location: "B2-02",
		supplier: "Silicon Bay Trading",
		specs: {
			tdp: 180,
			length: "242mm"
		}
	},
	{
		id: "p-gpu-9070",
		sku: "GPU-RX9070",
		name: "Radeon RX 9070 Pulse 16GB",
		brand: "Sapphire",
		categoryId: "cat-gpu",
		price: 38900,
		cost: 34500,
		serialTracked: true,
		warrantyMonths: 36,
		location: "B2-03",
		supplier: "Pacific Components",
		specs: {
			tdp: 220,
			length: "290mm"
		}
	},
	{
		id: "p-mb-b650m",
		sku: "MB-MSI-B650M",
		name: "MSI B650M Gaming Plus WiFi",
		brand: "MSI",
		categoryId: "cat-motherboard",
		price: 9450,
		cost: 7900,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A2-01",
		supplier: "Silicon Bay Trading",
		specs: {
			socket: "AM5",
			memoryType: "DDR5",
			formFactor: "mATX"
		}
	},
	{
		id: "p-mb-x670e",
		sku: "MB-ASUS-X670E",
		name: "ASUS ROG Strix X670E-A",
		brand: "ASUS",
		categoryId: "cat-motherboard",
		price: 24800,
		cost: 21200,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A2-02",
		supplier: "Nexlogic Distribution",
		specs: {
			socket: "AM5",
			memoryType: "DDR5",
			formFactor: "ATX"
		}
	},
	{
		id: "p-mb-b760m",
		sku: "MB-GB-B760M",
		name: "Gigabyte B760M DS3H DDR5",
		brand: "Gigabyte",
		categoryId: "cat-motherboard",
		price: 7850,
		cost: 6600,
		serialTracked: true,
		warrantyMonths: 36,
		location: "A2-03",
		supplier: "Pacific Components",
		specs: {
			socket: "LGA1700",
			memoryType: "DDR5",
			formFactor: "mATX"
		}
	},
	{
		id: "p-ram-fury32",
		sku: "RAM-KF-32GB-DDR5",
		name: "Kingston Fury Beast 32GB DDR5-6000",
		brand: "Kingston",
		categoryId: "cat-ram",
		price: 4250,
		cost: 3450,
		serialTracked: false,
		warrantyMonths: 60,
		location: "A3-01",
		supplier: "Pacific Components",
		specs: {
			memoryType: "DDR5",
			capacity: "32GB"
		}
	},
	{
		id: "p-ram-vengeance16",
		sku: "RAM-CS-16GB-DDR5",
		name: "Corsair Vengeance 16GB DDR5-5600",
		brand: "Corsair",
		categoryId: "cat-ram",
		price: 2650,
		cost: 2100,
		serialTracked: false,
		warrantyMonths: 60,
		location: "A3-02",
		supplier: "Pacific Components",
		specs: {
			memoryType: "DDR5",
			capacity: "16GB"
		}
	},
	{
		id: "p-ram-ddr4-16",
		sku: "RAM-KF-16GB-DDR4",
		name: "Kingston Fury Beast 16GB DDR4-3200",
		brand: "Kingston",
		categoryId: "cat-ram",
		price: 1950,
		cost: 1500,
		serialTracked: false,
		warrantyMonths: 60,
		location: "A3-03",
		supplier: "Pacific Components",
		specs: {
			memoryType: "DDR4",
			capacity: "16GB"
		}
	},
	{
		id: "p-ssd-990pro",
		sku: "SSD-SAM-990P-1TB",
		name: "Samsung 990 PRO 1TB NVMe",
		brand: "Samsung",
		categoryId: "cat-storage",
		price: 6450,
		cost: 5300,
		serialTracked: true,
		warrantyMonths: 60,
		location: "A4-01",
		supplier: "Nexlogic Distribution",
		specs: {
			capacity: "1TB",
			interface: "PCIe 4.0"
		}
	},
	{
		id: "p-ssd-p3plus",
		sku: "SSD-CRU-P3P-2TB",
		name: "Crucial P3 Plus 2TB NVMe",
		brand: "Crucial",
		categoryId: "cat-storage",
		price: 7200,
		cost: 6100,
		serialTracked: true,
		warrantyMonths: 60,
		location: "A4-02",
		supplier: "Silicon Bay Trading",
		specs: {
			capacity: "2TB",
			interface: "PCIe 4.0"
		}
	},
	{
		id: "p-hdd-2tb",
		sku: "HDD-SEA-2TB",
		name: "Seagate Barracuda 2TB HDD",
		brand: "Seagate",
		categoryId: "cat-storage",
		price: 3150,
		cost: 2600,
		serialTracked: true,
		warrantyMonths: 24,
		location: "A4-03",
		supplier: "Pacific Components",
		specs: {
			capacity: "2TB",
			interface: "SATA"
		}
	},
	{
		id: "p-psu-rm750e",
		sku: "PSU-CS-RM750E",
		name: "Corsair RM750e 750W 80+ Gold",
		brand: "Corsair",
		categoryId: "cat-psu",
		price: 5950,
		cost: 4900,
		serialTracked: true,
		warrantyMonths: 84,
		location: "C1-01",
		supplier: "Pacific Components",
		specs: {
			wattage: 750,
			rating: "80+ Gold"
		}
	},
	{
		id: "p-psu-mag850",
		sku: "PSU-MSI-A850G",
		name: "MSI MAG A850GL 850W 80+ Gold",
		brand: "MSI",
		categoryId: "cat-psu",
		price: 7150,
		cost: 6e3,
		serialTracked: true,
		warrantyMonths: 120,
		location: "C1-02",
		supplier: "Silicon Bay Trading",
		specs: {
			wattage: 850,
			rating: "80+ Gold"
		}
	},
	{
		id: "p-psu-cv550",
		sku: "PSU-CS-CV550",
		name: "Corsair CV550 550W 80+ Bronze",
		brand: "Corsair",
		categoryId: "cat-psu",
		price: 2950,
		cost: 2350,
		serialTracked: true,
		warrantyMonths: 36,
		location: "C1-03",
		supplier: "Pacific Components",
		specs: {
			wattage: 550,
			rating: "80+ Bronze"
		}
	},
	{
		id: "p-case-4000d",
		sku: "CASE-CS-4000D",
		name: "Corsair 4000D Airflow",
		brand: "Corsair",
		categoryId: "cat-case",
		price: 5250,
		cost: 4300,
		serialTracked: false,
		warrantyMonths: 24,
		location: "D1-01",
		supplier: "Pacific Components",
		specs: {
			formFactor: "ATX",
			maxGpu: "360mm"
		}
	},
	{
		id: "p-case-nrp200",
		sku: "CASE-NR-P200",
		name: "Cooler Master NR200P mITX",
		brand: "Cooler Master",
		categoryId: "cat-case",
		price: 5450,
		cost: 4500,
		serialTracked: false,
		warrantyMonths: 24,
		location: "D1-02",
		supplier: "Silicon Bay Trading",
		specs: {
			formFactor: "mITX",
			maxGpu: "330mm"
		}
	},
	{
		id: "p-cool-ak620",
		sku: "COOL-DD-AK620",
		name: "Deepcool AK620 Air Cooler",
		brand: "Deepcool",
		categoryId: "cat-cooling",
		price: 3450,
		cost: 2750,
		serialTracked: false,
		warrantyMonths: 36,
		location: "C2-01",
		supplier: "Pacific Components",
		specs: {
			tdp: 260,
			type: "Air"
		}
	},
	{
		id: "p-cool-h100i",
		sku: "COOL-CS-H100I",
		name: "Corsair iCUE H100i 240mm AIO",
		brand: "Corsair",
		categoryId: "cat-cooling",
		price: 8450,
		cost: 7100,
		serialTracked: true,
		warrantyMonths: 60,
		location: "C2-02",
		supplier: "Nexlogic Distribution",
		specs: {
			tdp: 250,
			type: "AIO"
		}
	},
	{
		id: "p-fan-arctic",
		sku: "FAN-ARC-P12-3PK",
		name: "Arctic P12 PWM 120mm (3-pack)",
		brand: "Arctic",
		categoryId: "cat-fans",
		price: 1350,
		cost: 980,
		serialTracked: false,
		warrantyMonths: 24,
		location: "C2-03",
		supplier: "Pacific Components",
		specs: { size: "120mm" }
	},
	{
		id: "p-mon-odyssey",
		sku: "MON-SAM-G5-27",
		name: "Samsung Odyssey G5 27\" 165Hz",
		brand: "Samsung",
		categoryId: "cat-monitor",
		price: 12900,
		cost: 10800,
		serialTracked: true,
		warrantyMonths: 36,
		location: "E1-01",
		supplier: "Nexlogic Distribution",
		specs: {
			size: "27\"",
			refresh: "165Hz"
		}
	},
	{
		id: "p-kb-k70",
		sku: "KB-CS-K70-RGB",
		name: "Corsair K70 RGB Mechanical",
		brand: "Corsair",
		categoryId: "cat-keyboard",
		price: 6250,
		cost: 5100,
		serialTracked: false,
		warrantyMonths: 24,
		location: "E2-01",
		supplier: "Pacific Components",
		specs: { switch: "MX Red" }
	},
	{
		id: "p-mouse-g502",
		sku: "MSE-LOG-G502X",
		name: "Logitech G502 X Wireless",
		brand: "Logitech",
		categoryId: "cat-mouse",
		price: 7450,
		cost: 6200,
		serialTracked: false,
		warrantyMonths: 24,
		location: "E2-02",
		supplier: "Pacific Components",
		specs: { dpi: 25600 }
	},
	{
		id: "p-hs-cloud3",
		sku: "HS-HX-CLOUD3",
		name: "HyperX Cloud III Headset",
		brand: "HyperX",
		categoryId: "cat-headset",
		price: 5450,
		cost: 4400,
		serialTracked: false,
		warrantyMonths: 24,
		location: "E2-03",
		supplier: "Silicon Bay Trading",
		specs: { connection: "Wired" }
	},
	{
		id: "p-net-ax3000",
		sku: "NET-TP-AX3000",
		name: "TP-Link Archer AX3000 Router",
		brand: "TP-Link",
		categoryId: "cat-networking",
		price: 4250,
		cost: 3450,
		serialTracked: true,
		warrantyMonths: 24,
		location: "F1-01",
		supplier: "Pacific Components",
		specs: { standard: "WiFi 6" }
	},
	{
		id: "p-acc-paste",
		sku: "ACC-TG-KRYO",
		name: "Thermal Grizzly Kryonaut 2g",
		brand: "Thermal Grizzly",
		categoryId: "cat-accessories",
		price: 950,
		cost: 690,
		serialTracked: false,
		warrantyMonths: 0,
		location: "F2-01",
		supplier: "Pacific Components",
		specs: {}
	},
	{
		id: "p-sw-win11",
		sku: "SW-MS-W11-PRO",
		name: "Windows 11 Pro OEM License",
		brand: "Microsoft",
		categoryId: "cat-software",
		price: 8900,
		cost: 7400,
		serialTracked: false,
		warrantyMonths: 0,
		location: "—",
		supplier: "Microsoft PH",
		specs: {}
	},
	{
		id: "s-assembly",
		sku: "SRV-ASSEMBLY",
		name: "Custom Build Assembly",
		brand: "DPC",
		categoryId: "cat-services",
		price: 2500,
		cost: 0,
		serialTracked: false,
		warrantyMonths: 3,
		location: "—",
		supplier: "In-house",
		specs: {},
		isService: true,
		productType: "service"
	},
	{
		id: "s-osinstall",
		sku: "SRV-OS-INSTALL",
		name: "OS Installation & Drivers",
		brand: "DPC",
		categoryId: "cat-services",
		price: 1e3,
		cost: 0,
		serialTracked: false,
		warrantyMonths: 1,
		location: "—",
		supplier: "In-house",
		specs: {},
		isService: true,
		productType: "service"
	},
	{
		id: "s-cable",
		sku: "SRV-CABLE-MGMT",
		name: "Premium Cable Management",
		brand: "DPC",
		categoryId: "cat-services",
		price: 500,
		cost: 0,
		serialTracked: false,
		warrantyMonths: 0,
		location: "—",
		supplier: "In-house",
		specs: {},
		isService: true,
		productType: "service"
	},
	{
		id: "s-maintenance",
		sku: "SRV-MAINTENANCE",
		name: "PC Maintenance Service",
		brand: "DPC",
		categoryId: "cat-services",
		price: 1500,
		cost: 0,
		serialTracked: false,
		warrantyMonths: 1,
		location: "—",
		supplier: "In-house",
		specs: {},
		isService: true,
		productType: "service"
	},
	{
		id: "s-diagnostic",
		sku: "SRV-DIAGNOSTIC",
		name: "Hardware Diagnostic",
		brand: "DPC",
		categoryId: "cat-services",
		price: 800,
		cost: 0,
		serialTracked: false,
		warrantyMonths: 0,
		location: "—",
		supplier: "In-house",
		specs: {},
		isService: true,
		productType: "service"
	}
];
var stockTable = {
	"p-cpu-7800x3d": [
		6,
		2,
		0,
		34,
		4
	],
	"p-cpu-7600": [
		11,
		1,
		0,
		41,
		5
	],
	"p-cpu-14600kf": [
		4,
		0,
		1,
		22,
		4
	],
	"p-gpu-5070": [
		5,
		3,
		0,
		18,
		4
	],
	"p-gpu-5060ti": [
		9,
		1,
		0,
		27,
		4
	],
	"p-gpu-9070": [
		3,
		1,
		0,
		9,
		3
	],
	"p-mb-b650m": [
		14,
		2,
		0,
		55,
		6
	],
	"p-mb-x670e": [
		3,
		1,
		0,
		12,
		3
	],
	"p-mb-b760m": [
		10,
		0,
		0,
		31,
		5
	],
	"p-ram-fury32": [
		22,
		4,
		0,
		88,
		10
	],
	"p-ram-vengeance16": [
		31,
		2,
		0,
		120,
		12
	],
	"p-ram-ddr4-16": [
		8,
		0,
		1,
		64,
		8
	],
	"p-ssd-990pro": [
		4,
		1,
		0,
		47,
		6
	],
	"p-ssd-p3plus": [
		12,
		0,
		0,
		29,
		5
	],
	"p-hdd-2tb": [
		7,
		0,
		0,
		19,
		4
	],
	"p-psu-rm750e": [
		13,
		2,
		0,
		44,
		6
	],
	"p-psu-mag850": [
		6,
		1,
		0,
		17,
		4
	],
	"p-psu-cv550": [
		2,
		0,
		0,
		33,
		5
	],
	"p-case-4000d": [
		9,
		2,
		0,
		38,
		4
	],
	"p-case-nrp200": [
		3,
		0,
		0,
		11,
		3
	],
	"p-cool-ak620": [
		15,
		1,
		0,
		52,
		6
	],
	"p-cool-h100i": [
		5,
		1,
		0,
		21,
		4
	],
	"p-fan-arctic": [
		26,
		0,
		0,
		74,
		10
	],
	"p-mon-odyssey": [
		7,
		1,
		0,
		25,
		3
	],
	"p-kb-k70": [
		10,
		0,
		0,
		36,
		5
	],
	"p-mouse-g502": [
		12,
		1,
		0,
		42,
		5
	],
	"p-hs-cloud3": [
		0,
		0,
		0,
		28,
		4
	],
	"p-net-ax3000": [
		8,
		0,
		0,
		15,
		3
	],
	"p-acc-paste": [
		34,
		0,
		0,
		96,
		10
	],
	"p-sw-win11": [
		18,
		2,
		0,
		61,
		6
	]
};
var inventory = products.filter((p) => !p.isService).map((p) => {
	const [onHand, reserved, damaged, sold, reorderPoint] = stockTable[p.id] ?? [
		10,
		0,
		0,
		0,
		4
	];
	return {
		productId: p.id,
		onHand,
		reserved,
		damaged,
		sold,
		reorderPoint
	};
});
function makeSerials() {
	const out = [];
	let n = 90210;
	for (const p of products.filter((x) => x.serialTracked)) {
		const inv = inventory.find((i) => i.productId === p.id);
		const total = inv.onHand;
		for (let i = 0; i < total; i++) {
			n += 137;
			const reserved = i < inv.reserved;
			out.push({
				id: `sn-${p.id}-${i}`,
				serial: `${p.sku.split("-").pop()}-${n}`,
				productId: p.id,
				status: reserved ? "reserved" : "in_stock"
			});
		}
	}
	out.push({
		id: "sn-sold-1",
		serial: "RTX5070-92831",
		productId: "p-gpu-5070",
		status: "installed",
		orderId: "DPC-10482",
		buildId: "BUILD-10482",
		customerId: "c-1",
		warrantyUntil: daysAhead$1(360)
	}, {
		id: "sn-sold-2",
		serial: "7800X3D-81204",
		productId: "p-cpu-7800x3d",
		status: "installed",
		orderId: "DPC-10482",
		buildId: "BUILD-10482",
		customerId: "c-1",
		warrantyUntil: daysAhead$1(360)
	}, {
		id: "sn-sold-3",
		serial: "990P-44120",
		productId: "p-ssd-990pro",
		status: "sold",
		orderId: "DPC-10479",
		customerId: "c-3",
		warrantyUntil: daysAhead$1(690)
	});
	return out;
}
var serials = makeSerials();
var customers = [
	{
		id: "c-1",
		name: "Juan Dela Cruz",
		email: "juan.delacruz@mailbox.ph",
		phone: "+63 917 224 8810",
		type: "individual",
		address: "Bacoor, Cavite",
		since: daysAgo$1(420),
		status: "active",
		notes: "Prefers AMD platforms. Repeat custom-build client."
	},
	{
		id: "c-2",
		name: "Northline Creatives Inc.",
		email: "it@northlinecreatives.ph",
		phone: "+63 2 8842 1190",
		type: "business",
		address: "Ortigas Center, Pasig",
		since: daysAgo$1(300),
		status: "active",
		notes: "Workstation fleet, invoices net-15."
	},
	{
		id: "c-3",
		name: "Maria Santiago",
		email: "m.santiago@mailbox.ph",
		phone: "+63 928 771 5502",
		type: "individual",
		address: "Quezon City",
		since: daysAgo$1(210),
		status: "active"
	},
	{
		id: "c-4",
		name: "Rafael Ong",
		email: "rafael.ong@mailbox.ph",
		phone: "+63 906 330 2214",
		type: "individual",
		address: "Makati City",
		since: daysAgo$1(160),
		status: "active"
	},
	{
		id: "c-5",
		name: "Bluewave Internet Cafe",
		email: "ops@bluewavecafe.ph",
		phone: "+63 933 108 7741",
		type: "business",
		address: "Imus, Cavite",
		since: daysAgo$1(540),
		status: "active",
		notes: "24 units on rolling upgrade cycle."
	},
	{
		id: "c-6",
		name: "Ellaine Bautista",
		email: "ellaine.b@mailbox.ph",
		phone: "+63 915 442 0098",
		type: "individual",
		address: "Las Piñas City",
		since: daysAgo$1(75),
		status: "inactive"
	}
];
var item = (productId, qty = 1) => {
	const p = products.find((x) => x.id === productId);
	return {
		productId,
		name: p.name,
		sku: p.sku,
		qty,
		unitPrice: p.price
	};
};
function totals(items, discount = 0, serviceTotal = 0) {
	const net = items.reduce((s, i) => s + i.qty * i.unitPrice, 0) + serviceTotal - discount;
	const subtotal = Math.round(net / 1.12 * 100) / 100;
	return {
		subtotal,
		tax: Math.round((net - subtotal) * 100) / 100,
		total: net
	};
}
function order(id, customerId, customerName, type, status, items, createdAt, opts = {}) {
	const discount = opts.discount ?? 0;
	const serviceTotal = opts.serviceTotal ?? 0;
	const t = totals(items, discount, serviceTotal);
	return {
		id,
		customerId,
		customerName,
		type,
		status,
		items,
		discount,
		serviceTotal,
		subtotal: t.subtotal,
		tax: t.tax,
		total: t.total,
		payment: opts.payment ?? {
			id: `pay-${id}`,
			method: "cash",
			amount: t.total,
			at: createdAt
		},
		createdAt,
		cashier: opts.cashier ?? "Paolo Cruz",
		timeline: opts.timeline ?? [
			{
				label: "Order created",
				at: createdAt,
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Payment received",
				at: createdAt,
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Released to customer",
				at: createdAt,
				actor: "Paolo Cruz",
				state: "done"
			}
		],
		...opts
	};
}
var orders = [
	order("DPC-10482", "c-1", "Juan Dela Cruz", "custom_build", "assembly", [
		item("p-cpu-7800x3d"),
		item("p-gpu-5070"),
		item("p-mb-b650m"),
		item("p-ram-fury32"),
		item("p-ssd-990pro"),
		item("p-psu-rm750e"),
		item("p-case-4000d"),
		item("p-cool-ak620")
	], daysAgo$1(0, 9), {
		serviceTotal: 4e3,
		discount: 2e3,
		buildId: "BUILD-10482",
		quoteId: "QT-10231",
		payment: {
			id: "pay-1",
			method: "bank",
			amount: 98500,
			at: daysAgo$1(0, 9)
		},
		timeline: [
			{
				label: "Payment received",
				at: daysAgo$1(0, 9),
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Parts reserved",
				at: daysAgo$1(0, 10),
				actor: "Dana Lim",
				state: "done"
			},
			{
				label: "Assembly started",
				at: daysAgo$1(0, 11),
				actor: "Ken Villareal",
				state: "active"
			},
			{
				label: "QA testing",
				at: "",
				state: "pending"
			},
			{
				label: "Build completed",
				at: "",
				state: "pending"
			},
			{
				label: "Ready for release",
				at: "",
				state: "pending"
			},
			{
				label: "Released",
				at: "",
				state: "pending"
			}
		]
	}),
	order("DPC-10481", "c-3", "Maria Santiago", "retail", "completed", [item("p-gpu-5070")], daysAgo$1(0, 13), { payment: {
		id: "pay-2",
		method: "gcash",
		amount: 42500,
		at: daysAgo$1(0, 13)
	} }),
	order("DPC-10480", null, "Walk-in Customer", "retail", "completed", [item("p-ram-fury32")], daysAgo$1(0, 14)),
	order("DPC-10479", "c-4", "Rafael Ong", "service", "completed", [item("s-maintenance")], daysAgo$1(1, 15), { payment: {
		id: "pay-4",
		method: "cash",
		amount: 1500,
		at: daysAgo$1(1, 15)
	} }),
	order("DPC-10478", "c-2", "Northline Creatives Inc.", "retail", "ready", [
		item("p-mon-odyssey", 3),
		item("p-kb-k70", 3),
		item("p-mouse-g502", 3)
	], daysAgo$1(1, 11), {
		discount: 3500,
		payment: {
			id: "pay-5",
			method: "bank",
			amount: 74300,
			at: daysAgo$1(1, 11)
		},
		cashier: "Mika Santos",
		timeline: [
			{
				label: "Payment received",
				at: daysAgo$1(1, 11),
				actor: "Mika Santos",
				state: "done"
			},
			{
				label: "Items picked",
				at: daysAgo$1(1, 12),
				actor: "Dana Lim",
				state: "done"
			},
			{
				label: "Ready for pickup",
				at: daysAgo$1(1, 13),
				actor: "Dana Lim",
				state: "active"
			},
			{
				label: "Released",
				at: "",
				state: "pending"
			}
		]
	}),
	order("DPC-10477", "c-5", "Bluewave Internet Cafe", "retail", "processing", [
		item("p-cpu-7600", 4),
		item("p-mb-b650m", 4),
		item("p-ram-vengeance16", 8)
	], daysAgo$1(2, 10), { payment: {
		id: "pay-6",
		method: "bank",
		amount: 106e3,
		at: daysAgo$1(2, 10)
	} }),
	order("DPC-10476", "c-6", "Ellaine Bautista", "retail", "refunded", [item("p-hs-cloud3")], daysAgo$1(4, 16), { payment: {
		id: "pay-7",
		method: "card",
		amount: 5450,
		at: daysAgo$1(4, 16)
	} }),
	order("DPC-10475", "c-1", "Juan Dela Cruz", "retail", "completed", [item("p-ssd-p3plus"), item("p-fan-arctic", 2)], daysAgo$1(6, 14)),
	order("DPC-10474", "c-3", "Maria Santiago", "retail", "pending", [item("p-gpu-9070")], daysAgo$1(7, 12), {
		payment: null,
		status: "pending"
	})
];
var quotes = [
	{
		id: "QT-10245",
		customerId: "c-4",
		customerName: "Rafael Ong",
		status: "pending",
		items: [
			item("p-cpu-14600kf"),
			item("p-mb-b760m"),
			item("p-ram-vengeance16", 2),
			item("p-gpu-5060ti"),
			item("p-ssd-990pro"),
			item("p-psu-rm750e"),
			item("p-case-4000d")
		],
		discount: 1500,
		serviceTotal: 4e3,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(1, 14),
		expiresAt: daysAhead$1(6),
		notes: "Editing workstation, prefers quiet operation.",
		preparedBy: "Mika Santos"
	},
	{
		id: "QT-10244",
		customerId: "c-5",
		customerName: "Bluewave Internet Cafe",
		status: "sent",
		items: [
			item("p-cpu-7600", 6),
			item("p-mb-b650m", 6),
			item("p-ram-vengeance16", 12)
		],
		discount: 6e3,
		serviceTotal: 9e3,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(3, 11),
		expiresAt: daysAhead$1(11),
		notes: "Phase 2 of cafe upgrade.",
		preparedBy: "Justine Ramos"
	},
	{
		id: "QT-10243",
		customerId: "c-2",
		customerName: "Northline Creatives Inc.",
		status: "approved",
		items: [item("p-mon-odyssey", 4)],
		discount: 2e3,
		serviceTotal: 0,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(5, 10),
		expiresAt: daysAhead$1(9),
		preparedBy: "Mika Santos"
	},
	{
		id: "QT-10242",
		customerId: "c-3",
		customerName: "Maria Santiago",
		status: "draft",
		items: [item("p-gpu-9070"), item("p-psu-mag850")],
		discount: 0,
		serviceTotal: 500,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(2, 16),
		expiresAt: daysAhead$1(12),
		preparedBy: "Paolo Cruz"
	},
	{
		id: "QT-10231",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		status: "converted",
		items: [
			item("p-cpu-7800x3d"),
			item("p-gpu-5070"),
			item("p-mb-b650m")
		],
		discount: 2e3,
		serviceTotal: 4e3,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(9, 15),
		expiresAt: daysAgo$1(-5),
		orderId: "DPC-10482",
		buildId: "BUILD-10482",
		preparedBy: "Justine Ramos"
	},
	{
		id: "QT-10228",
		customerId: "c-6",
		customerName: "Ellaine Bautista",
		status: "expired",
		items: [item("p-kb-k70"), item("p-mouse-g502")],
		discount: 0,
		serviceTotal: 0,
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: daysAgo$1(40, 12),
		expiresAt: daysAgo$1(26),
		preparedBy: "Paolo Cruz"
	}
];
for (const q of quotes) {
	const t = totals(q.items, q.discount, q.serviceTotal);
	q.subtotal = t.subtotal;
	q.tax = t.tax;
	q.total = t.total;
}
var standardQa = (passedCount) => {
	const hw = [
		"CPU installed & seated",
		"RAM detected (all slots)",
		"GPU detected",
		"Storage detected",
		"BIOS configured / EXPO enabled",
		"Cable management complete"
	];
	const test = [
		"POST successful",
		"Memory test (1 pass)",
		"CPU stress test 30 min",
		"GPU stress test 30 min",
		"Storage health check",
		"Thermal / temperature test"
	];
	return [...hw.map((l) => ({
		label: l,
		group: "hardware"
	})), ...test.map((l) => ({
		label: l,
		group: "testing"
	}))].map((c, i) => ({
		...c,
		passed: i < passedCount ? true : null
	}));
};
var builds = [
	{
		id: "BUILD-10482",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		purpose: "1440p gaming / streaming",
		budget: 1e5,
		status: "assembly",
		components: [
			{
				slot: "CPU",
				productId: "p-cpu-7800x3d",
				qty: 1
			},
			{
				slot: "Motherboard",
				productId: "p-mb-b650m",
				qty: 1
			},
			{
				slot: "RAM",
				productId: "p-ram-fury32",
				qty: 1
			},
			{
				slot: "GPU",
				productId: "p-gpu-5070",
				qty: 1
			},
			{
				slot: "Storage",
				productId: "p-ssd-990pro",
				qty: 1
			},
			{
				slot: "PSU",
				productId: "p-psu-rm750e",
				qty: 1
			},
			{
				slot: "Case",
				productId: "p-case-4000d",
				qty: 1
			},
			{
				slot: "Cooling",
				productId: "p-cool-ak620",
				qty: 1
			}
		],
		services: [
			{
				label: "Assembly",
				amount: 2500
			},
			{
				label: "Windows installation",
				amount: 1e3
			},
			{
				label: "Cable management",
				amount: 500
			}
		],
		technician: "Ken Villareal",
		createdAt: daysAgo$1(3, 10),
		orderId: "DPC-10482",
		quoteId: "QT-10231",
		notes: "Customer requested quiet fan curve and white cable extensions.",
		qa: standardQa(6),
		qaResult: null
	},
	{
		id: "BUILD-10479",
		customerId: "c-4",
		customerName: "Rafael Ong",
		purpose: "Video editing workstation",
		budget: 12e4,
		status: "quoted",
		components: [
			{
				slot: "CPU",
				productId: "p-cpu-14600kf",
				qty: 1
			},
			{
				slot: "Motherboard",
				productId: "p-mb-b760m",
				qty: 1
			},
			{
				slot: "RAM",
				productId: "p-ram-vengeance16",
				qty: 2
			},
			{
				slot: "GPU",
				productId: "p-gpu-5060ti",
				qty: 1
			},
			{
				slot: "Storage",
				productId: "p-ssd-990pro",
				qty: 1
			},
			{
				slot: "PSU",
				productId: "p-psu-rm750e",
				qty: 1
			},
			{
				slot: "Case",
				productId: "p-case-4000d",
				qty: 1
			}
		],
		services: [
			{
				label: "Assembly",
				amount: 2500
			},
			{
				label: "Windows installation",
				amount: 1e3
			},
			{
				label: "Cable management",
				amount: 500
			}
		],
		technician: "Ken Villareal",
		createdAt: daysAgo$1(1, 14),
		quoteId: "QT-10245",
		qa: standardQa(0),
		qaResult: null
	},
	{
		id: "BUILD-10477",
		customerId: "c-3",
		customerName: "Maria Santiago",
		purpose: "Compact ITX gaming build",
		budget: 9e4,
		status: "testing",
		components: [
			{
				slot: "CPU",
				productId: "p-cpu-7600",
				qty: 1
			},
			{
				slot: "Motherboard",
				productId: "p-mb-b650m",
				qty: 1
			},
			{
				slot: "RAM",
				productId: "p-ram-fury32",
				qty: 1
			},
			{
				slot: "GPU",
				productId: "p-gpu-9070",
				qty: 1
			},
			{
				slot: "Storage",
				productId: "p-ssd-p3plus",
				qty: 1
			},
			{
				slot: "PSU",
				productId: "p-psu-cv550",
				qty: 1
			},
			{
				slot: "Case",
				productId: "p-case-nrp200",
				qty: 1
			},
			{
				slot: "Cooling",
				productId: "p-cool-h100i",
				qty: 1
			}
		],
		services: [{
			label: "Assembly",
			amount: 2500
		}, {
			label: "Cable management",
			amount: 500
		}],
		technician: "Ken Villareal",
		createdAt: daysAgo$1(4, 9),
		qa: standardQa(9),
		qaResult: null,
		notes: "PSU headroom is tight with RX 9070 — flag for review."
	},
	{
		id: "BUILD-10474",
		customerId: "c-2",
		customerName: "Northline Creatives Inc.",
		purpose: "Studio render node",
		budget: 15e4,
		status: "consultation",
		components: [{
			slot: "CPU",
			productId: "p-cpu-7800x3d",
			qty: 1
		}],
		services: [{
			label: "Assembly",
			amount: 2500
		}],
		technician: "Unassigned",
		createdAt: daysAgo$1(2, 16),
		qa: standardQa(0),
		qaResult: null
	},
	{
		id: "BUILD-10468",
		customerId: "c-5",
		customerName: "Bluewave Internet Cafe",
		purpose: "Cafe station unit #7",
		budget: 45e3,
		status: "ready",
		components: [
			{
				slot: "CPU",
				productId: "p-cpu-7600",
				qty: 1
			},
			{
				slot: "Motherboard",
				productId: "p-mb-b650m",
				qty: 1
			},
			{
				slot: "RAM",
				productId: "p-ram-vengeance16",
				qty: 1
			},
			{
				slot: "Storage",
				productId: "p-ssd-p3plus",
				qty: 1
			},
			{
				slot: "PSU",
				productId: "p-psu-cv550",
				qty: 1
			},
			{
				slot: "Case",
				productId: "p-case-4000d",
				qty: 1
			}
		],
		services: [{
			label: "Assembly",
			amount: 2500
		}],
		technician: "Ken Villareal",
		createdAt: daysAgo$1(8, 11),
		qa: standardQa(12),
		qaResult: "pass"
	},
	{
		id: "BUILD-10461",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		purpose: "Secondary office PC",
		budget: 4e4,
		status: "released",
		components: [
			{
				slot: "CPU",
				productId: "p-cpu-7600",
				qty: 1
			},
			{
				slot: "Motherboard",
				productId: "p-mb-b760m",
				qty: 1
			},
			{
				slot: "RAM",
				productId: "p-ram-ddr4-16",
				qty: 1
			}
		],
		services: [{
			label: "Assembly",
			amount: 2500
		}],
		technician: "Ken Villareal",
		createdAt: daysAgo$1(30, 10),
		qa: standardQa(12),
		qaResult: "pass"
	}
];
var services = [
	{
		id: "SRV-10482",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		device: "Custom PC — Ryzen 7 5800X",
		issue: "Random shutdown under gaming load after ~20 minutes.",
		diagnosis: "Suspect PSU degradation; ruling out thermal throttling first.",
		status: "diagnosing",
		technician: "Ken Villareal",
		parts: [],
		labor: 800,
		estimatedCost: 800,
		actualCost: null,
		createdAt: daysAgo$1(0, 10),
		timeline: [
			{
				label: "Unit received",
				at: daysAgo$1(0, 10),
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Diagnostics started",
				at: daysAgo$1(0, 12),
				actor: "Ken Villareal",
				state: "active"
			},
			{
				label: "Repair",
				at: "",
				state: "pending"
			},
			{
				label: "Ready for release",
				at: "",
				state: "pending"
			}
		]
	},
	{
		id: "SRV-10481",
		customerId: "c-5",
		customerName: "Bluewave Internet Cafe",
		device: "Cafe unit #12",
		issue: "No display output after power outage.",
		diagnosis: "Motherboard VRM failure confirmed. Replacement required.",
		status: "waiting_parts",
		technician: "Ken Villareal",
		parts: [{
			productId: "p-mb-b650m",
			name: "MSI B650M Gaming Plus WiFi",
			qty: 1,
			price: 9450
		}],
		labor: 1200,
		estimatedCost: 10650,
		actualCost: null,
		createdAt: daysAgo$1(2, 9),
		timeline: [
			{
				label: "Unit received",
				at: daysAgo$1(2, 9),
				actor: "Dana Lim",
				state: "done"
			},
			{
				label: "Diagnosis complete",
				at: daysAgo$1(2, 14),
				actor: "Ken Villareal",
				state: "done"
			},
			{
				label: "Waiting for parts",
				at: daysAgo$1(1, 9),
				actor: "Dana Lim",
				state: "active"
			},
			{
				label: "Repair",
				at: "",
				state: "pending"
			}
		]
	},
	{
		id: "SRV-10480",
		customerId: "c-3",
		customerName: "Maria Santiago",
		device: "Laptop — Acer Nitro 5",
		issue: "Overheating and loud fan noise.",
		diagnosis: "Dust buildup, dried thermal paste.",
		status: "ready",
		technician: "Ken Villareal",
		parts: [{
			productId: "p-acc-paste",
			name: "Thermal Grizzly Kryonaut 2g",
			qty: 1,
			price: 950
		}],
		labor: 1500,
		estimatedCost: 2450,
		actualCost: 2450,
		createdAt: daysAgo$1(3, 11),
		timeline: [
			{
				label: "Unit received",
				at: daysAgo$1(3, 11),
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Diagnosis complete",
				at: daysAgo$1(3, 15),
				actor: "Ken Villareal",
				state: "done"
			},
			{
				label: "Repair complete",
				at: daysAgo$1(2, 11),
				actor: "Ken Villareal",
				state: "done"
			},
			{
				label: "Ready for release",
				at: daysAgo$1(2, 12),
				actor: "Ken Villareal",
				state: "active"
			}
		]
	},
	{
		id: "SRV-10478",
		customerId: "c-4",
		customerName: "Rafael Ong",
		device: "Custom PC — Intel i5-12400F",
		issue: "Requesting SSD upgrade and OS migration.",
		status: "released",
		technician: "Ken Villareal",
		parts: [{
			productId: "p-ssd-p3plus",
			name: "Crucial P3 Plus 2TB NVMe",
			qty: 1,
			price: 7200
		}],
		labor: 1e3,
		estimatedCost: 8200,
		actualCost: 8200,
		createdAt: daysAgo$1(9, 10),
		timeline: [
			{
				label: "Unit received",
				at: daysAgo$1(9, 10),
				actor: "Paolo Cruz",
				state: "done"
			},
			{
				label: "Upgrade complete",
				at: daysAgo$1(8, 13),
				actor: "Ken Villareal",
				state: "done"
			},
			{
				label: "Released",
				at: daysAgo$1(8, 16),
				actor: "Paolo Cruz",
				state: "done"
			}
		]
	}
];
var warranties = [
	{
		id: "WR-20481",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		productId: "p-gpu-5070",
		productName: "RTX 5070 Gaming OC 12GB",
		serial: "RTX5070-92831",
		orderId: "DPC-10482",
		purchasedAt: daysAgo$1(0, 9),
		expiresAt: daysAhead$1(1095),
		status: "active"
	},
	{
		id: "WR-20480",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		productId: "p-cpu-7800x3d",
		productName: "AMD Ryzen 7 7800X3D",
		serial: "7800X3D-81204",
		orderId: "DPC-10482",
		purchasedAt: daysAgo$1(0, 9),
		expiresAt: daysAhead$1(1095),
		status: "active"
	},
	{
		id: "WR-20477",
		customerId: "c-3",
		customerName: "Maria Santiago",
		productId: "p-ssd-990pro",
		productName: "Samsung 990 PRO 1TB NVMe",
		serial: "990P-44120",
		orderId: "DPC-10479",
		purchasedAt: daysAgo$1(120, 11),
		expiresAt: daysAhead$1(1700),
		status: "active"
	},
	{
		id: "WR-20461",
		customerId: "c-5",
		customerName: "Bluewave Internet Cafe",
		productId: "p-psu-cv550",
		productName: "Corsair CV550 550W 80+ Bronze",
		orderId: "DPC-10475",
		purchasedAt: daysAgo$1(1080, 10),
		expiresAt: daysAhead$1(14),
		status: "expiring"
	},
	{
		id: "WR-20455",
		customerId: "c-6",
		customerName: "Ellaine Bautista",
		productId: "p-kb-k70",
		productName: "Corsair K70 RGB Mechanical",
		orderId: "DPC-10460",
		purchasedAt: daysAgo$1(800, 12),
		expiresAt: daysAgo$1(70),
		status: "expired"
	},
	{
		id: "WR-20452",
		customerId: "c-2",
		customerName: "Northline Creatives Inc.",
		productId: "p-mon-odyssey",
		productName: "Samsung Odyssey G5 27\" 165Hz",
		serial: "G5-27-77120",
		orderId: "DPC-10478",
		purchasedAt: daysAgo$1(200, 10),
		expiresAt: daysAhead$1(900),
		status: "active"
	}
];
var warrantyClaims = [{
	id: "WC-3012",
	warrantyId: "WR-20461",
	reason: "PSU fails to power on intermittently.",
	status: "in_review",
	createdAt: daysAgo$1(1, 13),
	timeline: [{
		label: "Claim opened — PSU fails to power on intermittently.",
		at: daysAgo$1(1, 13),
		actor: "Paolo Cruz"
	}, {
		label: "Status set to in review",
		at: daysAgo$1(1, 9),
		actor: "Mika Santos"
	}]
}, {
	id: "WC-3011",
	warrantyId: "WR-20452",
	reason: "Dead pixel cluster on lower-right quadrant.",
	status: "approved",
	createdAt: daysAgo$1(6, 10),
	resolution: "Approved for supplier RMA replacement.",
	timeline: [
		{
			label: "Claim opened — Dead pixel cluster on lower-right quadrant.",
			at: daysAgo$1(6, 10),
			actor: "Kevin Villanueva"
		},
		{
			label: "Status set to in review",
			at: daysAgo$1(5, 11),
			actor: "Mika Santos"
		},
		{
			label: "Status set to approved — Approved for supplier RMA replacement.",
			at: daysAgo$1(3, 14),
			actor: "Justine Ramos"
		}
	]
}];
var movements = [
	{
		id: "mv-1",
		productId: "p-gpu-5070",
		type: "reserved",
		qty: 1,
		at: daysAgo$1(0, 10),
		actor: "Dana Lim",
		reference: "DPC-10482"
	},
	{
		id: "mv-2",
		productId: "p-gpu-5070",
		type: "received",
		qty: 6,
		at: daysAgo$1(5, 9),
		actor: "Dana Lim",
		reference: "PO-8841"
	},
	{
		id: "mv-3",
		productId: "p-cpu-7800x3d",
		type: "sold",
		qty: 1,
		at: daysAgo$1(0, 9),
		actor: "Paolo Cruz",
		reference: "DPC-10482"
	},
	{
		id: "mv-4",
		productId: "p-ram-fury32",
		type: "sold",
		qty: 1,
		at: daysAgo$1(0, 14),
		actor: "Paolo Cruz",
		reference: "DPC-10480"
	},
	{
		id: "mv-5",
		productId: "p-cpu-14600kf",
		type: "damaged",
		qty: 1,
		at: daysAgo$1(3, 15),
		actor: "Dana Lim",
		note: "Bent pins on socket contact — supplier RMA filed."
	},
	{
		id: "mv-6",
		productId: "p-hs-cloud3",
		type: "returned",
		qty: 1,
		at: daysAgo$1(4, 16),
		actor: "Paolo Cruz",
		reference: "DPC-10476"
	},
	{
		id: "mv-7",
		productId: "p-psu-cv550",
		type: "adjusted",
		qty: -1,
		at: daysAgo$1(7, 10),
		actor: "Mika Santos",
		note: "Cycle count correction."
	}
];
var auditLogs = [
	{
		id: "al-1",
		actor: "Justine Ramos",
		role: "owner",
		action: "created quote QT-10244",
		entity: "QT-10244",
		at: daysAgo$1(0, 8)
	},
	{
		id: "al-2",
		actor: "Ken Villareal",
		role: "technician",
		action: "started assembly on BUILD-10482",
		entity: "BUILD-10482",
		at: daysAgo$1(0, 11)
	},
	{
		id: "al-3",
		actor: "Paolo Cruz",
		role: "cashier",
		action: "completed order DPC-10481",
		entity: "DPC-10481",
		at: daysAgo$1(0, 13)
	},
	{
		id: "al-4",
		actor: "Dana Lim",
		role: "inventory",
		action: "received 6 units of GPU-RTX5070",
		entity: "p-gpu-5070",
		at: daysAgo$1(0, 9)
	},
	{
		id: "al-5",
		actor: "Mika Santos",
		role: "admin",
		action: "adjusted stock for PSU-CS-CV550",
		entity: "p-psu-cv550",
		at: daysAgo$1(1, 10)
	},
	{
		id: "al-6",
		actor: "Ken Villareal",
		role: "technician",
		action: "marked BUILD-10468 QA as passed",
		entity: "BUILD-10468",
		at: daysAgo$1(1, 15)
	}
];
var notifications = [
	{
		id: "n-1",
		title: "Out of stock: HyperX Cloud III",
		body: "0 units available. 4 units below reorder point.",
		priority: "critical",
		at: daysAgo$1(0, 8),
		read: false,
		kind: "stock"
	},
	{
		id: "n-2",
		title: "Build ready for release",
		body: "BUILD-10468 passed QA and is awaiting customer pickup.",
		priority: "high",
		at: daysAgo$1(0, 9),
		read: false,
		kind: "build"
	},
	{
		id: "n-3",
		title: "Quote approved",
		body: "Northline Creatives Inc. approved QT-10243.",
		priority: "high",
		at: daysAgo$1(0, 10),
		read: false,
		kind: "quote"
	},
	{
		id: "n-4",
		title: "Warranty expiring in 14 days",
		body: "WR-20461 — Corsair CV550 for Bluewave Internet Cafe.",
		priority: "normal",
		at: daysAgo$1(1, 9),
		read: true,
		kind: "warranty"
	},
	{
		id: "n-5",
		title: "Service ticket updated",
		body: "SRV-10481 moved to Waiting for Parts.",
		priority: "normal",
		at: daysAgo$1(1, 11),
		read: true,
		kind: "service"
	}
];
Array.from({ length: 30 }, (_, i) => {
	const d = /* @__PURE__ */ new Date(now$1 - (29 - i) * 864e5);
	const wave = Math.sin(i / 2.6) * .28 + Math.cos(i / 5) * .14;
	const weekend = [0, 6].includes(d.getDay()) ? 1.24 : 1;
	const revenue = Math.round((92e3 + wave * 46e3) * weekend);
	const orderCount = Math.max(6, Math.round(revenue / 5200));
	return {
		date: d.toISOString(),
		label: d.toLocaleDateString("en-PH", {
			month: "short",
			day: "numeric"
		}),
		revenue,
		orders: orderCount
	};
});
Array.from({ length: 11 }, (_, i) => {
	const hour = 9 + i;
	const rev = [
		4200,
		8600,
		12400,
		9800,
		7400,
		15200,
		18600,
		12800,
		16400,
		14200,
		8900
	][i] ?? 8e3;
	return {
		label: `${hour}:00`,
		date: "",
		revenue: rev,
		orders: Math.max(1, Math.round(rev / 5200))
	};
});
var listeners = /* @__PURE__ */ new Set();
function onBuildStatus(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function emitBuildStatus(buildId, status) {
	for (const listener of listeners) listener(buildId, status);
}
var peso = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0
});
var pesoCents = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	minimumFractionDigits: 2
});
var money = (n) => peso.format(n);
var moneyExact = (n) => pesoCents.format(n);
var num = (n) => new Intl.NumberFormat("en-PH").format(n);
var VAT_RATE = .12;
function dateShort(iso) {
	return new Date(iso).toLocaleDateString("en-PH", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function dateTime(iso) {
	return new Date(iso).toLocaleString("en-PH", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function relative(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.round(diff / 6e4);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.round(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.round(hrs / 24);
	if (days < 30) return `${days}d ago`;
	return dateShort(iso);
}
function daysUntil(iso) {
	return Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
}
function titleCase(s) {
	return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function greeting(d = /* @__PURE__ */ new Date()) {
	const h = d.getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/ops-data-Dz2fMTmV.js
/**
* DEMO DATA — operations dataset (purchasing, receiving, returns, shifts,
* consultations, tasks, staff, assembly/QA, releases).
*
* Every record references ids that already exist in demo-data.ts so the whole
* system reads as one connected shop.
*/
var now = Date.now();
var daysAgo = (d, h = 10) => {
	const x = /* @__PURE__ */ new Date(now - d * 864e5);
	x.setHours(h, d * 11 % 60, 0, 0);
	return x.toISOString();
};
var daysAhead = (d, h = 14) => {
	const x = new Date(now + d * 864e5);
	x.setHours(h, 0, 0, 0);
	return x.toISOString();
};
var p = (id) => products.find((x) => x.id === id);
var suppliers = [
	{
		id: "sup-1",
		name: "Nexlogic Distribution",
		contact: "Arnel Bautista",
		email: "sales@nexlogic.ph",
		phone: "+63 2 8871 3320",
		address: "Gil Puyat Ave, Makati City",
		terms: "Net 30",
		leadTimeDays: 5,
		categories: [
			"CPU",
			"Motherboard",
			"RAM"
		],
		status: "active",
		rating: 4.6,
		notes: "Primary AMD platform source. Reliable on lead times."
	},
	{
		id: "sup-2",
		name: "Silicon Bay Trading",
		contact: "Grace Tan",
		email: "orders@siliconbay.ph",
		phone: "+63 2 8534 7781",
		address: "Gilmore Ave, Quezon City",
		terms: "Net 15",
		leadTimeDays: 3,
		categories: [
			"GPU",
			"Storage",
			"PSU"
		],
		status: "active",
		rating: 4.2,
		notes: "GPU allocations are limited during launch windows."
	},
	{
		id: "sup-3",
		name: "Pacific Components",
		contact: "Dennis Yu",
		email: "dennis@pacificcomponents.ph",
		phone: "+63 917 662 4410",
		address: "Cebu Business Park, Cebu",
		terms: "50% DP, balance on delivery",
		leadTimeDays: 7,
		categories: [
			"Case",
			"Cooling",
			"Fans",
			"Accessories"
		],
		status: "active",
		rating: 3.9
	},
	{
		id: "sup-4",
		name: "Microsoft PH",
		contact: "Partner Desk",
		email: "partners@microsoft.ph",
		phone: "+63 2 8888 4444",
		address: "BGC, Taguig",
		terms: "Prepaid",
		leadTimeDays: 1,
		categories: ["Software"],
		status: "active",
		rating: 4.8
	},
	{
		id: "sup-5",
		name: "Eastridge Peripherals",
		contact: "Lloyd Chua",
		email: "lloyd@eastridge.ph",
		phone: "+63 995 118 2204",
		address: "Banawe, Quezon City",
		terms: "Net 15",
		leadTimeDays: 4,
		categories: [
			"Keyboard",
			"Mouse",
			"Headset",
			"Monitor"
		],
		status: "inactive",
		rating: 3.4,
		notes: "On hold — repeated short deliveries in Q1."
	}
];
var line = (productId, qty, received = 0) => {
	const prod = p(productId);
	return {
		productId,
		name: prod.name,
		sku: prod.sku,
		qty,
		received,
		unitCost: prod.cost
	};
};
var totalOf = (lines) => lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
var po = (id, supplierId, supplierName, status, lines, createdAt, expectedAt, extra = {}) => ({
	id,
	supplierId,
	supplierName,
	status,
	lines,
	total: totalOf(lines),
	createdAt,
	expectedAt,
	createdBy: "Dana Lim",
	...extra
});
var purchaseOrders = [
	po("PO-2026-00142", "sup-2", "Silicon Bay Trading", "received", [
		line("p-gpu-5070", 5, 5),
		line("p-ssd-990pro", 10, 10),
		line("p-psu-rm750e", 8, 8)
	], daysAgo(9), daysAgo(4), {
		receivedAt: daysAgo(4),
		notes: "Complete delivery, no discrepancies."
	}),
	po("PO-2026-00143", "sup-1", "Nexlogic Distribution", "partial", [
		line("p-cpu-7800x3d", 10, 6),
		line("p-mb-b650m", 8, 8),
		line("p-ram-fury32", 12, 0)
	], daysAgo(6), daysAgo(1), { notes: "RAM backordered to next shipment." }),
	po("PO-2026-00144", "sup-3", "Pacific Components", "confirmed", [
		line("p-case-4000d", 6),
		line("p-cool-ak620", 10),
		line("p-fan-arctic", 24)
	], daysAgo(3), daysAhead(2)),
	po("PO-2026-00145", "sup-2", "Silicon Bay Trading", "submitted", [line("p-gpu-5060ti", 6), line("p-ssd-p3plus", 12)], daysAgo(1), daysAhead(5), { notes: "Awaiting supplier confirmation on GPU allocation." }),
	po("PO-2026-00146", "sup-4", "Microsoft PH", "draft", [line("p-sw-win11", 15)], daysAgo(0, 9), daysAhead(3)),
	po("PO-2026-00141", "sup-1", "Nexlogic Distribution", "cancelled", [line("p-cpu-14600kf", 6)], daysAgo(16), daysAgo(9), { notes: "Cancelled — pricing changed after quotation expired." })
];
var goodsReceipts = [{
	id: "GR-00318",
	purchaseOrderId: "PO-2026-00142",
	supplierId: "sup-2",
	supplierName: "Silicon Bay Trading",
	status: "completed",
	receivedBy: "Dana Lim",
	receivedAt: daysAgo(4),
	lines: [
		{
			productId: "p-gpu-5070",
			name: p("p-gpu-5070").name,
			sku: p("p-gpu-5070").sku,
			expected: 5,
			received: 5,
			damaged: 0,
			serials: [
				"SN-5070-A1147",
				"SN-5070-A1148",
				"SN-5070-A1149",
				"SN-5070-A1150",
				"SN-5070-A1151"
			]
		},
		{
			productId: "p-ssd-990pro",
			name: p("p-ssd-990pro").name,
			sku: p("p-ssd-990pro").sku,
			expected: 10,
			received: 10,
			damaged: 0,
			serials: []
		},
		{
			productId: "p-psu-rm750e",
			name: p("p-psu-rm750e").name,
			sku: p("p-psu-rm750e").sku,
			expected: 8,
			received: 8,
			damaged: 0,
			serials: []
		}
	],
	notes: "Cartons sealed, spot-checked 3 units."
}, {
	id: "GR-00319",
	purchaseOrderId: "PO-2026-00143",
	supplierId: "sup-1",
	supplierName: "Nexlogic Distribution",
	status: "discrepancy",
	receivedBy: "Dana Lim",
	receivedAt: daysAgo(1),
	lines: [
		{
			productId: "p-cpu-7800x3d",
			name: p("p-cpu-7800x3d").name,
			sku: p("p-cpu-7800x3d").sku,
			expected: 10,
			received: 6,
			damaged: 0,
			serials: [
				"SN-7800-C2201",
				"SN-7800-C2202",
				"SN-7800-C2203"
			]
		},
		{
			productId: "p-mb-b650m",
			name: p("p-mb-b650m").name,
			sku: p("p-mb-b650m").sku,
			expected: 8,
			received: 8,
			damaged: 1,
			serials: []
		},
		{
			productId: "p-ram-fury32",
			name: p("p-ram-fury32").name,
			sku: p("p-ram-fury32").sku,
			expected: 12,
			received: 0,
			damaged: 0,
			serials: []
		}
	],
	notes: "Short 4 CPUs, 1 board with dented I/O shield. Debit memo requested."
}];
var returnRequests = [
	{
		id: "RMA-00214",
		orderId: "DPC-10481",
		customerId: "c-3",
		customerName: "Maria Santiago",
		productId: "p-gpu-5070",
		productName: p("p-gpu-5070").name,
		serial: "SN-5070-A1102",
		qty: 1,
		reason: "Artifacting under load after 3 days",
		condition: "defective",
		resolution: "replacement",
		refundMethod: null,
		refundAmount: 0,
		status: "approved",
		createdAt: daysAgo(2),
		inspectedBy: "Ken Villareal",
		inspectionNotes: "Reproduced artifacts in FurMark within 4 minutes. Supplier RMA raised.",
		restock: false
	},
	{
		id: "RMA-00213",
		orderId: "DPC-10479",
		customerId: "c-4",
		customerName: "Rafael Ong",
		productId: "p-kb-k70",
		productName: p("p-kb-k70").name,
		qty: 1,
		reason: "Wrong switch type ordered",
		condition: "sealed",
		resolution: "refund",
		refundMethod: "gcash",
		refundAmount: p("p-kb-k70").price,
		status: "refunded",
		createdAt: daysAgo(5),
		inspectedBy: "Mika Santos",
		inspectionNotes: "Box seal intact, returned to sellable stock.",
		restock: true
	},
	{
		id: "RMA-00215",
		orderId: "DPC-10478",
		customerId: "c-2",
		customerName: "Northline Creatives Inc.",
		productId: "p-mon-odyssey",
		productName: p("p-mon-odyssey").name,
		qty: 2,
		reason: "Dead pixels on both panels",
		condition: "used_good",
		resolution: "none",
		refundMethod: null,
		refundAmount: 0,
		status: "inspection",
		createdAt: daysAgo(0, 11),
		restock: false,
		notes: "Customer requests replacement units from next shipment."
	}
];
var adj = (id, kind, amount, reason, at, actor = "Paolo Cruz") => ({
	id,
	kind,
	amount,
	reason,
	at,
	actor
});
var shifts = [
	{
		id: "SH-00482",
		cashier: "Paolo Cruz",
		status: "open",
		openedAt: daysAgo(0, 8),
		openingCash: 5e3,
		adjustments: [adj("ca-1", "cash_out", 850, "Delivery rider reimbursement", daysAgo(0, 11)), adj("ca-2", "cash_in", 2e3, "Change fund top-up", daysAgo(0, 13))]
	},
	{
		id: "SH-00481",
		cashier: "Paolo Cruz",
		status: "closed",
		openedAt: daysAgo(1, 8),
		closedAt: daysAgo(1, 20),
		openingCash: 5e3,
		countedCash: 18420,
		refunds: 1200,
		tenders: {
			cash: 14620,
			gcash: 42500,
			card: 0,
			bank: 98500
		},
		adjustments: [adj("ca-3", "cash_out", 1e3, "Supplier courier fee", daysAgo(1, 15))],
		notes: "Variance −₱200, short change from a cash sale. Logged for review."
	},
	{
		id: "SH-00480",
		cashier: "Mika Santos",
		status: "closed",
		openedAt: daysAgo(2, 8),
		closedAt: daysAgo(2, 20),
		openingCash: 5e3,
		countedCash: 22300,
		refunds: 0,
		tenders: {
			cash: 17300,
			gcash: 12800,
			card: 24500,
			bank: 0
		},
		adjustments: []
	}
];
var consultations = [
	{
		id: "CONS-10482",
		customerId: "c-1",
		customerName: "Juan Dela Cruz",
		status: "won",
		primaryUse: "Gaming + streaming",
		budget: 12e4,
		targetResolution: "1440p / 165Hz",
		workloads: [
			"Valorant",
			"Cyberpunk 2077",
			"OBS streaming"
		],
		preferences: [
			"NVIDIA GPU",
			"32GB RAM",
			"2TB NVMe",
			"White case"
		],
		existingHardware: ["Odyssey G5 monitor", "K70 keyboard"],
		upgradeOnly: false,
		consultant: "Justine Ramos",
		createdAt: daysAgo(12),
		recommendedBuildId: "BUILD-10482",
		quoteId: "QT-10231",
		notes: "Wants quiet operation. Approved after one revision on the GPU tier."
	},
	{
		id: "CONS-10485",
		customerId: "c-5",
		customerName: "Grace Villanueva",
		status: "recommended",
		primaryUse: "Video editing / colour grading",
		budget: 165e3,
		targetResolution: "4K editing timeline",
		workloads: [
			"DaVinci Resolve",
			"Premiere Pro",
			"After Effects"
		],
		preferences: [
			"64GB RAM",
			"Fast scratch NVMe",
			"Quiet cooling"
		],
		existingHardware: ["Dual 27\" monitors"],
		upgradeOnly: false,
		consultant: "Mika Santos",
		createdAt: daysAgo(3),
		recommendedBuildId: "BUILD-10479",
		notes: "Needs quotation by end of week; considering a second machine in Q3."
	},
	{
		id: "CONS-10486",
		customerId: "c-4",
		customerName: "Rafael Ong",
		status: "requirements",
		primaryUse: "Upgrade — GPU + storage",
		budget: 55e3,
		targetResolution: "1080p / 240Hz",
		workloads: ["CS2", "Apex Legends"],
		preferences: ["Keep existing case", "Reuse 650W PSU if adequate"],
		existingHardware: [
			"Ryzen 5 5600",
			"B550 board",
			"16GB DDR4",
			"650W PSU"
		],
		upgradeOnly: true,
		consultant: "Justine Ramos",
		createdAt: daysAgo(1),
		notes: "PSU headroom needs checking before recommending a 5070."
	},
	{
		id: "CONS-10484",
		customerId: "c-2",
		customerName: "Northline Creatives Inc.",
		status: "quoted",
		primaryUse: "Studio workstation fleet (4 units)",
		budget: 48e4,
		targetResolution: "1440p",
		workloads: [
			"Adobe CC",
			"Figma",
			"Light 3D"
		],
		preferences: ["Identical spec across units", "Net-15 invoicing"],
		existingHardware: [],
		upgradeOnly: false,
		consultant: "Justine Ramos",
		createdAt: daysAgo(7),
		quoteId: "QT-10244"
	},
	{
		id: "CONS-10480",
		customerId: "c-6",
		customerName: "Ivan Reyes",
		status: "lost",
		primaryUse: "Budget esports build",
		budget: 38e3,
		targetResolution: "1080p",
		workloads: ["Valorant", "Dota 2"],
		preferences: ["Cheapest viable"],
		existingHardware: [],
		upgradeOnly: false,
		consultant: "Paolo Cruz",
		createdAt: daysAgo(18),
		notes: "Bought a prebuilt elsewhere on promo pricing."
	}
];
var staff = [
	{
		id: "u-1",
		name: "Justine Ramos",
		initials: "JR",
		role: "Owner",
		skills: [
			"Consultation",
			"Sales",
			"Approvals"
		],
		shift: "Mon–Sat 09:00–18:00",
		status: "available",
		completed: 128
	},
	{
		id: "u-2",
		name: "Mika Santos",
		initials: "MS",
		role: "Admin",
		skills: [
			"Purchasing",
			"QA",
			"Returns"
		],
		shift: "Mon–Fri 09:00–18:00",
		status: "busy",
		completed: 96
	},
	{
		id: "u-3",
		name: "Paolo Cruz",
		initials: "PC",
		role: "Cashier",
		skills: ["POS", "Cash drawer"],
		shift: "Mon–Sat 08:00–20:00",
		status: "available",
		completed: 412
	},
	{
		id: "u-4",
		name: "Ken Villareal",
		initials: "KV",
		role: "Technician",
		skills: [
			"Assembly",
			"Diagnostics",
			"Stress testing"
		],
		shift: "Tue–Sun 10:00–19:00",
		status: "busy",
		completed: 214
	},
	{
		id: "u-5",
		name: "Dana Lim",
		initials: "DL",
		role: "Inventory",
		skills: [
			"Receiving",
			"Serial capture",
			"Stock counts"
		],
		shift: "Mon–Sat 08:00–17:00",
		status: "available",
		completed: 173
	},
	{
		id: "u-6",
		name: "Rico Alcantara",
		initials: "RA",
		role: "Technician",
		skills: [
			"Assembly",
			"Cable management",
			"OS imaging"
		],
		shift: "Mon–Sat 12:00–21:00",
		status: "off",
		completed: 88
	}
];
var tasks = [
	{
		id: "TASK-10482",
		title: "Install Windows 11 + chipset drivers",
		detail: "Activate with customer-supplied key, then run Windows Update twice.",
		assignee: "Ken Villareal",
		priority: "high",
		status: "in_progress",
		dueAt: daysAhead(0, 17),
		createdAt: daysAgo(0, 9),
		link: {
			kind: "build",
			id: "BUILD-10482"
		}
	},
	{
		id: "TASK-10483",
		title: "Capture serials for GR-00319 CPUs",
		assignee: "Dana Lim",
		priority: "normal",
		status: "todo",
		dueAt: daysAhead(1),
		createdAt: daysAgo(1, 12),
		link: {
			kind: "receiving",
			id: "GR-00319"
		}
	},
	{
		id: "TASK-10484",
		title: "Thermal re-test after cooler reseat",
		assignee: "Ken Villareal",
		priority: "urgent",
		status: "blocked",
		detail: "Blocked until replacement thermal paste arrives from PO-2026-00144.",
		dueAt: daysAhead(0, 19),
		createdAt: daysAgo(0, 11),
		link: {
			kind: "qa",
			id: "BUILD-10479"
		}
	},
	{
		id: "TASK-10485",
		title: "Call Maria Santiago about GPU replacement ETA",
		assignee: "Mika Santos",
		priority: "high",
		status: "todo",
		dueAt: daysAhead(0, 16),
		createdAt: daysAgo(0, 10),
		link: {
			kind: "customer",
			id: "c-3"
		}
	},
	{
		id: "TASK-10479",
		title: "Diagnose no-POST unit SRV-10481",
		assignee: "Rico Alcantara",
		priority: "normal",
		status: "done",
		dueAt: daysAgo(1, 17),
		createdAt: daysAgo(2, 10),
		link: {
			kind: "service",
			id: "SRV-10481"
		}
	},
	{
		id: "TASK-10486",
		title: "Prepare release documents for DPC-10482",
		assignee: "Paolo Cruz",
		priority: "normal",
		status: "todo",
		dueAt: daysAhead(2),
		createdAt: daysAgo(0, 12),
		link: {
			kind: "order",
			id: "DPC-10482"
		}
	}
];
var assemblySteps = (done) => [
	"CPU installed",
	"Cooler mounted",
	"RAM installed",
	"Storage installed",
	"Motherboard seated",
	"PSU installed",
	"GPU installed",
	"Cable management",
	"Front panel wiring"
].map((label, i) => ({
	label,
	done: i < done
}));
var testSet = (results, readings = []) => [
	"CPU stress test",
	"GPU stress test",
	"Memory test",
	"Thermal test",
	"Stability test"
].map((label, i) => ({
	label,
	result: results[i] ?? null,
	reading: readings[i]
}));
var buildOps = [
	{
		buildId: "BUILD-10482",
		stage: "testing",
		assembly: assemblySteps(9),
		tests: testSet([
			"pass",
			"pass",
			"pass",
			null,
			null
		], [
			"Max 78°C @ 30 min",
			"Max 71°C, 0 artifacts",
			"4 passes, 0 errors",
			void 0,
			void 0
		]),
		technician: "Ken Villareal",
		qaStaff: "Mika Santos",
		notes: "Awaiting thermal soak and 2-hour stability run."
	},
	{
		buildId: "BUILD-10479",
		stage: "assembly",
		assembly: assemblySteps(6),
		tests: testSet([
			null,
			null,
			null,
			null,
			null
		]),
		technician: "Rico Alcantara",
		qaStaff: "Mika Santos"
	},
	{
		buildId: "BUILD-10477",
		stage: "ready",
		assembly: assemblySteps(9),
		tests: testSet([
			"pass",
			"pass",
			"pass",
			"pass",
			"pass"
		], [
			"Max 74°C",
			"Max 68°C",
			"6 passes, 0 errors",
			"Idle 34°C",
			"8h loop clean"
		]),
		technician: "Ken Villareal",
		qaStaff: "Justine Ramos",
		qaSignedAt: daysAgo(2, 16)
	},
	{
		buildId: "BUILD-10474",
		stage: "released",
		assembly: assemblySteps(9),
		tests: testSet([
			"pass",
			"pass",
			"pass",
			"pass",
			"pass"
		]),
		technician: "Ken Villareal",
		qaStaff: "Mika Santos",
		qaSignedAt: daysAgo(6, 15)
	}
];
var releases = [
	{
		id: "REL-00311",
		kind: "build",
		refId: "BUILD-10477",
		customerName: "Maria Santiago",
		method: "pickup",
		scheduledAt: daysAhead(1, 15),
		status: "scheduled",
		notes: "Customer will bring their own monitor for a final check."
	},
	{
		id: "REL-00310",
		kind: "build",
		refId: "BUILD-10474",
		customerName: "Northline Creatives Inc.",
		method: "delivery",
		scheduledAt: daysAgo(5, 14),
		status: "completed",
		releasedBy: "Dana Lim",
		receivedBy: "R. Manalo (IT Lead)",
		releasedAt: daysAgo(5, 15)
	},
	{
		id: "REL-00312",
		kind: "service",
		refId: "SRV-10478",
		customerName: "Rafael Ong",
		method: "pickup",
		scheduledAt: daysAgo(0, 17),
		status: "released",
		releasedBy: "Paolo Cruz",
		receivedBy: "Rafael Ong",
		releasedAt: daysAgo(0, 17)
	}
];
var company = {
	name: "Dream PC Build & IT Solutions",
	short: "DPC NEXUS",
	address: "2F Unit 4, Aguinaldo Highway, Bacoor, Cavite",
	phone: "+63 917 555 0142",
	email: "sales@dreampcbuild.ph",
	tin: "009-482-771-000"
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DXywCOrU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-uT6jtvew.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
/**
* DPC NEXUS — demo data layer / state container.
*
* This is the single seam between the UI and data. Today it is an in-memory
* store seeded from demo-data.ts and persisted to localStorage. When a real
* backend is introduced, replace the action bodies with API calls; component
* code should not need to change.
*
* DEMO ONLY: no server, no real auth, no real inventory sync.
*/
var STORAGE_KEY$1 = "dpc-nexus-demo-v1";
/**
* Bump when the persisted snapshot shape changes incompatibly so that stale
* localStorage from an older app version is discarded and re-seeded instead
* of crashing the UI.
*/
var SCHEMA_VERSION$1 = 3;
function seed$1() {
	return {
		schemaVersion: SCHEMA_VERSION$1,
		user: null,
		categories: structuredClone(categories),
		products: structuredClone(products),
		inventory: structuredClone(inventory),
		serials: structuredClone(serials),
		customers: structuredClone(customers),
		orders: structuredClone(orders),
		quotes: structuredClone(quotes),
		builds: structuredClone(builds),
		services: structuredClone(services),
		warranties: structuredClone(warranties),
		claims: structuredClone(warrantyClaims),
		movements: structuredClone(movements),
		auditLogs: structuredClone(auditLogs),
		notifications: structuredClone(notifications),
		cart: [],
		cartDiscount: 0,
		cartCustomerId: null,
		heldCarts: [],
		counters: {
			order: 10483,
			quote: 10246,
			build: 10483,
			service: 10483,
			customer: 7
		},
		sidebarCollapsed: false
	};
}
function computeTotals(lines, discount = 0, serviceTotal = 0) {
	const gross = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
	const net = Math.max(0, gross + serviceTotal - discount);
	const subtotal = Math.round(net / (1 + VAT_RATE) * 100) / 100;
	return {
		gross,
		discount,
		serviceTotal,
		net,
		subtotal,
		tax: Math.round((net - subtotal) * 100) / 100,
		total: net
	};
}
var StoreContext = (0, import_react.createContext)(null);
function StoreProvider({ children }) {
	const [state, setState] = (0, import_react.useState)(() => seed$1());
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const skipWrite = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY$1);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed.schemaVersion === SCHEMA_VERSION$1) setState((prev) => ({
					...prev,
					...parsed
				}));
				else localStorage.removeItem(STORAGE_KEY$1);
			}
		} catch {}
		skipWrite.current = false;
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (skipWrite.current) return;
		try {
			localStorage.setItem(STORAGE_KEY$1, JSON.stringify(state));
		} catch {}
	}, [state]);
	const patch = (0, import_react.useCallback)((fn) => {
		setState((prev) => fn(prev));
	}, []);
	const productById = (0, import_react.useCallback)((id) => state.products.find((p) => p.id === id), [state.products]);
	const invFor = (0, import_react.useCallback)((productId) => state.inventory.find((i) => i.productId === productId), [state.inventory]);
	const availableOf = (0, import_react.useCallback)((productId) => {
		if (productById(productId)?.isService) return Infinity;
		const inv = state.inventory.find((i) => i.productId === productId);
		if (!inv) return 0;
		return Math.max(0, inv.onHand - inv.reserved);
	}, [state.inventory, productById]);
	const customerById = (0, import_react.useCallback)((id) => id ? state.customers.find((c) => c.id === id) : void 0, [state.customers]);
	const categoryById = (0, import_react.useCallback)((id) => state.categories.find((c) => c.id === id), [state.categories]);
	const categoryNameOf = (0, import_react.useCallback)((categoryId) => categoryById(categoryId)?.name ?? "Uncategorized", [categoryById]);
	const log = (s, action, entity) => [{
		id: `al-${Math.random().toString(36).slice(2, 9)}`,
		actor: s.user?.name ?? "Demo User",
		role: s.user?.role ?? "owner",
		action,
		entity,
		at: (/* @__PURE__ */ new Date()).toISOString()
	}, ...s.auditLogs];
	const notify = (s, n) => [{
		...n,
		id: `n-${Math.random().toString(36).slice(2, 9)}`,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		read: false
	}, ...s.notifications];
	const value = (0, import_react.useMemo)(() => {
		const lineFor = (l) => {
			const p = productById(l.productId);
			return {
				productId: l.productId,
				name: p?.name ?? "Unknown product",
				sku: p?.sku ?? "N/A",
				qty: l.qty,
				unitPrice: p?.price ?? 0,
				serials: l.serials
			};
		};
		return {
			...state,
			hydrated,
			signInAs: (role, password) => {
				const u = demoUsers.find((u) => u.role === role);
				if (!u || !u.password || password !== u.password) return {
					ok: false,
					error: "Incorrect password for this role. Use the demo password shown below."
				};
				patch((s) => ({
					...s,
					user: u
				}));
				return { ok: true };
			},
			signOut: () => patch((s) => ({
				...s,
				user: null
			})),
			productById,
			invFor,
			availableOf,
			customerById,
			categoryById,
			categoryNameOf,
			setSidebarCollapsed: (v) => patch((s) => ({
				...s,
				sidebarCollapsed: v
			})),
			addToCart: (productId, qty = 1) => {
				const p = productById(productId);
				if (!p) return {
					ok: false,
					error: "Unknown product."
				};
				if (p.archived) return {
					ok: false,
					error: "This product is archived."
				};
				const avail = availableOf(productId);
				const existing = state.cart.find((l) => l.productId === productId);
				const nextQty = (existing?.qty ?? 0) + qty;
				if (!p.isService && nextQty > avail) return {
					ok: false,
					error: `Only ${avail} available in stock.`
				};
				patch((s) => ({
					...s,
					cart: existing ? s.cart.map((l) => l.productId === productId ? {
						...l,
						qty: nextQty
					} : l) : [...s.cart, {
						productId,
						qty
					}]
				}));
				return { ok: true };
			},
			setCartQty: (productId, qty) => patch((s) => ({
				...s,
				cart: qty <= 0 ? s.cart.filter((l) => l.productId !== productId) : s.cart.map((l) => l.productId === productId ? {
					...l,
					qty
				} : l)
			})),
			removeCartLine: (productId) => patch((s) => ({
				...s,
				cart: s.cart.filter((l) => l.productId !== productId)
			})),
			clearCart: () => patch((s) => ({
				...s,
				cart: [],
				cartDiscount: 0,
				cartCustomerId: null
			})),
			setCartDiscount: (v) => patch((s) => ({
				...s,
				cartDiscount: Math.max(0, v)
			})),
			setCartCustomer: (id) => patch((s) => ({
				...s,
				cartCustomerId: id
			})),
			holdCart: () => patch((s) => s.cart.length === 0 ? s : {
				...s,
				heldCarts: [{
					id: `HOLD-${s.heldCarts.length + 1}`,
					at: (/* @__PURE__ */ new Date()).toISOString(),
					lines: s.cart,
					customerId: s.cartCustomerId
				}, ...s.heldCarts],
				cart: [],
				cartDiscount: 0
			}),
			resumeHeldCart: (id) => patch((s) => {
				const held = s.heldCarts.find((h) => h.id === id);
				if (!held) return s;
				return {
					...s,
					cart: held.lines,
					cartCustomerId: held.customerId,
					heldCarts: s.heldCarts.filter((h) => h.id !== id)
				};
			}),
			completeSale: (method, opts = {}) => {
				const items = state.cart.map(lineFor);
				const serviceTotal = items.reduce((sum, i) => productById(i.productId)?.isService ? sum + i.qty * i.unitPrice : sum, 0);
				const t = computeTotals(items.filter((i) => !productById(i.productId)?.isService), state.cartDiscount, serviceTotal);
				const id = `DPC-${state.counters.order}`;
				const at = (/* @__PURE__ */ new Date()).toISOString();
				const customer = customerById(state.cartCustomerId);
				const payment = {
					id: `pay-${id}`,
					method,
					amount: t.total,
					at,
					reference: opts.reference,
					tendered: opts.tendered,
					change: opts.change
				};
				const soldSerials = /* @__PURE__ */ new Map();
				for (const i of items) {
					const p = productById(i.productId);
					if (!p?.serialTracked || !i.serials?.length) continue;
					const until = /* @__PURE__ */ new Date();
					until.setMonth(until.getMonth() + p.warrantyMonths);
					soldSerials.set(i.productId, i.serials.map((ser) => ({
						ser,
						until: until.toISOString()
					})));
				}
				const newWarranties = items.flatMap((i, lineIdx) => {
					const p = productById(i.productId);
					const sold = soldSerials.get(i.productId);
					if (!p || !sold?.length) return [];
					const exp = /* @__PURE__ */ new Date();
					exp.setMonth(exp.getMonth() + (p.warrantyMonths ?? 0));
					return sold.map(({ ser }, serialIdx) => ({
						id: `WR-${id}-${lineIdx}-${serialIdx}`,
						customerId: state.cartCustomerId ?? "walk-in",
						customerName: customer?.name ?? "Walk-in Customer",
						productId: p.id,
						productName: p.name,
						serial: ser,
						orderId: id,
						purchasedAt: at,
						expiresAt: exp.toISOString(),
						status: "active"
					}));
				});
				const newOrder = {
					id,
					customerId: state.cartCustomerId,
					customerName: customer?.name ?? "Walk-in Customer",
					type: items.some((i) => productById(i.productId)?.isService) ? "service" : "retail",
					status: "paid",
					items,
					subtotal: t.subtotal,
					discount: state.cartDiscount,
					tax: t.tax,
					serviceTotal,
					total: t.total,
					payment,
					createdAt: at,
					notes: opts.notes,
					cashier: state.user?.name ?? "Demo User",
					timeline: [
						{
							label: "Order created",
							at,
							actor: state.user?.name,
							state: "done"
						},
						{
							label: "Payment received",
							at,
							actor: state.user?.name,
							state: "done"
						},
						{
							label: "Ready for release",
							at,
							state: "active"
						},
						{
							label: "Released",
							at: "",
							state: "pending"
						}
					]
				};
				patch((s) => ({
					...s,
					orders: [newOrder, ...s.orders],
					inventory: s.inventory.map((inv) => {
						const line = items.find((i) => i.productId === inv.productId);
						if (!line) return inv;
						return {
							...inv,
							onHand: Math.max(0, inv.onHand - line.qty),
							sold: inv.sold + line.qty
						};
					}),
					movements: [...items.map((i) => ({
						id: `mv-${Math.random().toString(36).slice(2, 9)}`,
						productId: i.productId,
						type: "sold",
						qty: i.qty,
						at,
						actor: s.user?.name ?? "Demo User",
						reference: id
					})), ...s.movements],
					serials: s.serials.map((sn) => {
						const match = soldSerials.get(sn.productId)?.find((m) => m.ser === sn.serial);
						if (!match) return sn;
						return {
							...sn,
							status: "sold",
							orderId: id,
							customerId: state.cartCustomerId ?? void 0,
							warrantyUntil: match.until
						};
					}),
					warranties: [...newWarranties, ...s.warranties],
					counters: {
						...s.counters,
						order: s.counters.order + 1
					},
					cart: [],
					cartDiscount: 0,
					cartCustomerId: null,
					notifications: notify(s, {
						title: "Payment completed",
						body: `${id} — ${customer?.name ?? "Walk-in Customer"}`,
						priority: "normal",
						kind: "payment"
					}),
					auditLogs: log(s, `completed order ${id}`, id)
				}));
				return newOrder;
			},
			availableSerialsOf: (productId) => state.serials.filter((sn) => sn.productId === productId && sn.status === "in_stock"),
			setCartLineSerials: (productId, serials) => patch((s) => ({
				...s,
				cart: s.cart.map((l) => l.productId === productId ? {
					...l,
					serials
				} : l)
			})),
			registerSerials: (productId, serials, ref) => {
				const known = new Set(state.serials.map((sn) => sn.serial.toLowerCase()));
				const fresh = serials.map((x) => x.trim()).filter(Boolean).filter((x) => !known.has(x.toLowerCase())).map((x) => ({
					id: `sn-${Math.random().toString(36).slice(2, 9)}`,
					serial: x,
					productId,
					status: "in_stock"
				}));
				if (fresh.length === 0) return 0;
				patch((s) => ({
					...s,
					serials: [...fresh, ...s.serials],
					auditLogs: log(s, `registered ${fresh.length} serial(s) for ${productId}${ref ? ` (${ref})` : ""}`, productId)
				}));
				return fresh.length;
			},
			updateSerial: (serialId, p) => patch((s) => ({
				...s,
				serials: s.serials.map((sn) => sn.id === serialId ? {
					...sn,
					...p
				} : sn),
				auditLogs: log(s, `updated serial ${serialId} (${p.status ?? "modified"})`, serialId)
			})),
			createCustomer: (data) => {
				const customer = {
					...data,
					id: `c-${state.counters.customer}`,
					since: (/* @__PURE__ */ new Date()).toISOString(),
					status: "active"
				};
				patch((s) => ({
					...s,
					customers: [customer, ...s.customers],
					counters: {
						...s.counters,
						customer: s.counters.customer + 1
					},
					auditLogs: log(s, `created customer ${customer.name}`, customer.id)
				}));
				return customer;
			},
			createProduct: (data, opts = {}) => {
				const sku = data.sku.trim().toUpperCase();
				if (state.products.some((p) => p.sku.toUpperCase() === sku)) return {
					ok: false,
					error: `SKU ${sku} already exists in the catalog.`
				};
				if (!categoryById(data.categoryId)) return {
					ok: false,
					error: "Select a valid category."
				};
				const id = `p-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 900 + 100)}`;
				const product = {
					...data,
					id,
					sku,
					productType: data.productType ?? (data.isService ? "service" : "product"),
					archived: false
				};
				const onHand = Math.max(0, Math.floor(opts.onHand ?? 0));
				const reorderPoint = Math.max(0, Math.floor(opts.reorderPoint ?? 4));
				patch((s) => ({
					...s,
					products: [product, ...s.products],
					inventory: s.inventory.some((i) => i.productId === id) ? s.inventory : [...s.inventory, {
						productId: id,
						onHand,
						reserved: 0,
						damaged: 0,
						sold: 0,
						reorderPoint
					}],
					auditLogs: log(s, `created product ${product.name} (${sku})`, id)
				}));
				return {
					ok: true,
					product
				};
			},
			updateProduct: (productId, patchData, opts = {}) => {
				const existing = productById(productId);
				if (!existing) return {
					ok: false,
					error: "Product not found."
				};
				const sku = (patchData.sku ?? existing.sku).trim().toUpperCase();
				if (state.products.some((p) => p.id !== productId && p.sku.toUpperCase() === sku)) return {
					ok: false,
					error: `SKU ${sku} already exists in the catalog.`
				};
				const hasStockPatch = opts.onHand !== void 0 || opts.reorderPoint !== void 0;
				const next = {
					...patchData,
					sku
				};
				if (next.productType === void 0 && next.isService !== void 0) next.productType = next.isService ? "service" : "product";
				patch((s) => {
					const newMovements = hasStockPatch && opts.onHand !== void 0 ? [...s.movements, {
						id: `mv-${Math.random().toString(36).slice(2, 9)}`,
						productId,
						type: "adjusted",
						qty: opts.onHand - (invFor(productId)?.onHand ?? 0),
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: s.user?.name ?? "Demo User",
						note: "Stock level edited in product form"
					}] : s.movements;
					return {
						...s,
						products: s.products.map((p) => p.id === productId ? {
							...p,
							...next
						} : p),
						inventory: hasStockPatch ? s.inventory.map((i) => i.productId === productId ? {
							...i,
							onHand: opts.onHand !== void 0 ? Math.max(0, Math.floor(opts.onHand)) : i.onHand,
							reorderPoint: opts.reorderPoint !== void 0 ? Math.max(0, Math.floor(opts.reorderPoint)) : i.reorderPoint
						} : i) : s.inventory,
						movements: newMovements,
						auditLogs: log(s, `updated product ${productId} (${sku})`, productId)
					};
				});
				return { ok: true };
			},
			archiveProduct: (productId) => patch((s) => ({
				...s,
				products: s.products.map((p) => p.id === productId ? {
					...p,
					archived: true
				} : p),
				auditLogs: log(s, `archived product ${productId}`, productId)
			})),
			reactivateProduct: (productId) => patch((s) => ({
				...s,
				products: s.products.map((p) => p.id === productId ? {
					...p,
					archived: false
				} : p),
				auditLogs: log(s, `reactivated product ${productId}`, productId)
			})),
			deleteProduct: (productId) => patch((s) => ({
				...s,
				products: s.products.filter((p) => p.id !== productId),
				inventory: s.inventory.filter((i) => i.productId !== productId),
				auditLogs: log(s, `deleted product ${productId}`, productId)
			})),
			createCategory: (name) => {
				const trimmed = name.trim();
				if (!trimmed) return {
					ok: false,
					error: "Category name is required."
				};
				if (state.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return {
					ok: false,
					error: `Category "${trimmed}" already exists.`
				};
				const category = {
					id: `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
					name: trimmed,
					archived: false,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				patch((s) => ({
					...s,
					categories: [...s.categories, category],
					auditLogs: log(s, `created category ${category.name}`, category.id)
				}));
				return {
					ok: true,
					category
				};
			},
			updateCategory: (categoryId, patchData) => {
				const existing = categoryById(categoryId);
				if (!existing) return {
					ok: false,
					error: "Category not found."
				};
				const name = (patchData.name ?? existing.name).trim();
				if (!name) return {
					ok: false,
					error: "Category name is required."
				};
				if (state.categories.some((c) => c.id !== categoryId && c.name.toLowerCase() === name.toLowerCase())) return {
					ok: false,
					error: `Category "${name}" already exists.`
				};
				patch((s) => ({
					...s,
					categories: s.categories.map((c) => c.id === categoryId ? {
						...c,
						name
					} : c),
					auditLogs: log(s, `renamed category ${existing.name} to ${name}`, categoryId)
				}));
				return { ok: true };
			},
			archiveCategory: (categoryId) => patch((s) => ({
				...s,
				categories: s.categories.map((c) => c.id === categoryId ? {
					...c,
					archived: true
				} : c),
				auditLogs: log(s, `archived category ${categoryId}`, categoryId)
			})),
			reactivateCategory: (categoryId) => patch((s) => ({
				...s,
				categories: s.categories.map((c) => c.id === categoryId ? {
					...c,
					archived: false
				} : c),
				auditLogs: log(s, `reactivated category ${categoryId}`, categoryId)
			})),
			updateOrderStatus: (orderId, status) => patch((s) => ({
				...s,
				orders: s.orders.map((o) => o.id === orderId ? {
					...o,
					status,
					timeline: [...o.timeline.map((t) => t.state === "active" ? {
						...t,
						state: "done"
					} : t), {
						label: `Status set to ${status.replace(/_/g, " ")}`,
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: s.user?.name,
						state: "active"
					}]
				} : o),
				auditLogs: log(s, `set order ${orderId} to ${status}`, orderId)
			})),
			createQuote: ({ customerId, items, discount, serviceTotal, notes, expiresInDays }) => {
				const lines = items.map((i) => {
					const p = productById(i.productId);
					return {
						productId: i.productId,
						name: p?.name ?? "Unknown product",
						sku: p?.sku ?? "N/A",
						qty: i.qty,
						unitPrice: p?.price ?? 0
					};
				});
				const t = computeTotals(lines, discount, serviceTotal);
				const id = `QT-${state.counters.quote}`;
				const quote = {
					id,
					customerId,
					customerName: customerById(customerId)?.name ?? "Walk-in Customer",
					status: "draft",
					items: lines,
					discount,
					serviceTotal,
					subtotal: t.subtotal,
					tax: t.tax,
					total: t.total,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					expiresAt: new Date(Date.now() + expiresInDays * 864e5).toISOString(),
					notes,
					preparedBy: state.user?.name ?? "Demo User"
				};
				patch((s) => ({
					...s,
					quotes: [quote, ...s.quotes],
					counters: {
						...s.counters,
						quote: s.counters.quote + 1
					},
					auditLogs: log(s, `created quote ${id}`, id)
				}));
				return quote;
			},
			setQuoteStatus: (quoteId, status) => patch((s) => ({
				...s,
				quotes: s.quotes.map((q) => q.id === quoteId ? {
					...q,
					status
				} : q),
				auditLogs: log(s, `set quote ${quoteId} to ${status}`, quoteId),
				notifications: status === "approved" ? notify(s, {
					title: "Quote approved",
					body: `${quoteId} was marked approved.`,
					priority: "high",
					kind: "quote"
				}) : s.notifications
			})),
			convertQuoteToOrder: (quoteId) => {
				const quote = state.quotes.find((q) => q.id === quoteId);
				if (!quote) return null;
				const id = `DPC-${state.counters.order}`;
				const at = (/* @__PURE__ */ new Date()).toISOString();
				const newOrder = {
					id,
					customerId: quote.customerId,
					customerName: quote.customerName,
					type: quote.buildId ? "custom_build" : "retail",
					status: "pending",
					items: quote.items,
					subtotal: quote.subtotal,
					discount: quote.discount,
					tax: quote.tax,
					serviceTotal: quote.serviceTotal,
					total: quote.total,
					payment: null,
					createdAt: at,
					quoteId: quote.id,
					buildId: quote.buildId,
					cashier: state.user?.name ?? "Demo User",
					timeline: [
						{
							label: `Converted from quote ${quote.id}`,
							at,
							actor: state.user?.name,
							state: "done"
						},
						{
							label: "Awaiting payment",
							at,
							state: "active"
						},
						{
							label: "Parts reserved",
							at: "",
							state: "pending"
						},
						{
							label: "Released",
							at: "",
							state: "pending"
						}
					]
				};
				const toReserve = /* @__PURE__ */ new Map();
				for (const l of quote.items) if (productById(l.productId)?.serialTracked) toReserve.set(l.productId, l.qty);
				patch((s) => ({
					...s,
					orders: [newOrder, ...s.orders],
					quotes: s.quotes.map((q) => q.id === quoteId ? {
						...q,
						status: "converted",
						orderId: id
					} : q),
					builds: quote.buildId ? s.builds.map((b) => b.id === quote.buildId ? {
						...b,
						orderId: id,
						status: "parts_reserved"
					} : b) : s.builds,
					inventory: s.inventory.map((inv) => {
						const line = quote.items.find((i) => i.productId === inv.productId);
						if (!line) return inv;
						return {
							...inv,
							reserved: inv.reserved + line.qty
						};
					}),
					serials: s.serials.map((sn) => {
						const rem = toReserve.get(sn.productId);
						if (rem === void 0 || sn.status !== "in_stock" || rem <= 0) return sn;
						toReserve.set(sn.productId, rem - 1);
						return {
							...sn,
							status: "reserved",
							orderId: id
						};
					}),
					counters: {
						...s.counters,
						order: s.counters.order + 1
					},
					auditLogs: log(s, `converted quote ${quoteId} into order ${id}`, id)
				}));
				if (quote.buildId) emitBuildStatus(quote.buildId, "parts_reserved");
				return newOrder;
			},
			createBuild: ({ customerId, purpose, budget, notes, consultationId }) => {
				const id = `BUILD-${state.counters.build}`;
				const build = {
					id,
					customerId,
					customerName: customerById(customerId)?.name ?? "Walk-in Customer",
					purpose,
					budget,
					status: "draft",
					components: [],
					services: [
						{
							label: "Assembly",
							amount: 2500
						},
						{
							label: "Windows installation",
							amount: 1e3
						},
						{
							label: "Cable management",
							amount: 500
						}
					],
					technician: state.user?.role === "technician" ? state.user.name : "Unassigned",
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					notes,
					consultationId,
					qa: builds[1]?.qa.map((c) => ({
						...c,
						passed: null
					})) ?? [],
					qaResult: null
				};
				patch((s) => ({
					...s,
					builds: [build, ...s.builds],
					counters: {
						...s.counters,
						build: s.counters.build + 1
					},
					auditLogs: log(s, `created build ${id}`, id)
				}));
				return build;
			},
			updateBuild: (buildId, p) => patch((s) => ({
				...s,
				builds: s.builds.map((b) => b.id === buildId ? {
					...b,
					...p
				} : b)
			})),
			addBuildComponent: (buildId, slot, pid, qty = 1) => patch((s) => ({
				...s,
				builds: s.builds.map((b) => {
					if (b.id !== buildId) return b;
					const existing = b.components.find((c) => c.productId === pid);
					return {
						...b,
						components: existing ? b.components.map((c) => c.productId === pid ? {
							...c,
							qty: c.qty + qty
						} : c) : [...b.components, {
							slot,
							productId: pid,
							qty
						}]
					};
				}),
				auditLogs: log(s, `added component ${pid} to ${buildId}`, buildId)
			})),
			removeBuildComponent: (buildId, pid) => patch((s) => ({
				...s,
				builds: s.builds.map((b) => b.id === buildId ? {
					...b,
					components: b.components.filter((c) => c.productId !== pid)
				} : b),
				auditLogs: log(s, `removed component ${pid} from ${buildId}`, buildId)
			})),
			setBuildComponentQty: (buildId, pid, qty) => patch((s) => ({
				...s,
				builds: s.builds.map((b) => b.id === buildId ? {
					...b,
					components: b.components.map((c) => c.productId === pid ? {
						...c,
						qty: Math.max(1, Math.floor(qty))
					} : c)
				} : b),
				auditLogs: log(s, `set qty ${Math.max(1, Math.floor(qty))} for ${pid} in ${buildId}`, buildId)
			})),
			setBuildStatus: (buildId, status) => {
				emitBuildStatus(buildId, status);
				patch((s) => ({
					...s,
					builds: s.builds.map((b) => b.id === buildId ? {
						...b,
						status
					} : b),
					auditLogs: log(s, `set build ${buildId} to ${status}`, buildId),
					notifications: status === "ready" ? notify(s, {
						title: "Build ready for release",
						body: `${buildId} is awaiting customer pickup.`,
						priority: "high",
						kind: "build"
					}) : s.notifications
				}));
			},
			toggleQaCheck: (buildId, label, v) => patch((s) => ({
				...s,
				builds: s.builds.map((b) => b.id === buildId ? {
					...b,
					qa: b.qa.map((c) => c.label === label ? {
						...c,
						passed: v
					} : c)
				} : b)
			})),
			finalizeQa: (buildId, result) => {
				patch((s) => ({
					...s,
					builds: s.builds.map((b) => b.id === buildId ? {
						...b,
						qaResult: result,
						status: result === "pass" ? "ready" : b.status
					} : b),
					auditLogs: log(s, `marked build ${buildId} QA as ${result}`, buildId),
					notifications: notify(s, {
						title: result === "pass" ? "Build QA passed" : "Build QA failed",
						body: `${buildId} QA result recorded.`,
						priority: result === "pass" ? "normal" : "critical",
						kind: "build"
					})
				}));
				if (result === "pass") emitBuildStatus(buildId, "ready");
			},
			quoteFromBuild: (buildId) => {
				const build = state.builds.find((b) => b.id === buildId);
				if (!build) return null;
				const lines = build.components.map((c) => {
					const p = productById(c.productId);
					return {
						productId: c.productId,
						name: p?.name ?? "Unknown component",
						sku: p?.sku ?? "N/A",
						qty: c.qty,
						unitPrice: p?.price ?? 0
					};
				});
				const serviceTotal = build.services.reduce((s, x) => s + x.amount, 0);
				const t = computeTotals(lines, 0, serviceTotal);
				const id = `QT-${state.counters.quote}`;
				const quote = {
					id,
					customerId: build.customerId,
					customerName: build.customerName,
					status: "draft",
					items: lines,
					discount: 0,
					serviceTotal,
					subtotal: t.subtotal,
					tax: t.tax,
					total: t.total,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					expiresAt: new Date(Date.now() + 12096e5).toISOString(),
					buildId: build.id,
					notes: `Quotation for ${build.purpose}.`,
					preparedBy: state.user?.name ?? "Demo User"
				};
				patch((s) => ({
					...s,
					quotes: [quote, ...s.quotes],
					builds: s.builds.map((b) => b.id === buildId ? {
						...b,
						quoteId: id,
						status: "quoted"
					} : b),
					counters: {
						...s.counters,
						quote: s.counters.quote + 1
					},
					auditLogs: log(s, `generated quote ${id} from ${buildId}`, id)
				}));
				return quote;
			},
			createService: ({ customerId, device, issue, estimatedCost, labor }) => {
				const id = `SRV-${state.counters.service}`;
				const at = (/* @__PURE__ */ new Date()).toISOString();
				const ticket = {
					id,
					customerId,
					customerName: customerById(customerId)?.name ?? "Walk-in Customer",
					device,
					issue,
					status: "received",
					technician: state.user?.role === "technician" ? state.user.name : "Unassigned",
					parts: [],
					labor,
					estimatedCost,
					actualCost: null,
					createdAt: at,
					timeline: [
						{
							label: "Unit received",
							at,
							actor: state.user?.name,
							state: "active"
						},
						{
							label: "Diagnostics",
							at: "",
							state: "pending"
						},
						{
							label: "Repair",
							at: "",
							state: "pending"
						},
						{
							label: "Ready for release",
							at: "",
							state: "pending"
						}
					]
				};
				patch((s) => ({
					...s,
					services: [ticket, ...s.services],
					counters: {
						...s.counters,
						service: s.counters.service + 1
					},
					auditLogs: log(s, `created service ticket ${id}`, id)
				}));
				return ticket;
			},
			setServiceStatus: (id, status) => patch((s) => ({
				...s,
				services: s.services.map((t) => t.id === id ? {
					...t,
					status,
					timeline: [...t.timeline.map((e) => e.state === "active" ? {
						...e,
						state: "done"
					} : e), {
						label: `Status set to ${status.replace(/_/g, " ")}`,
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: s.user?.name,
						state: "active"
					}]
				} : t),
				auditLogs: log(s, `set service ${id} to ${status}`, id)
			})),
			updateService: (ticketId, p) => patch((s) => ({
				...s,
				services: s.services.map((t) => t.id === ticketId ? {
					...t,
					...p
				} : t),
				auditLogs: log(s, `updated service ${ticketId}`, ticketId)
			})),
			addServicePart: (ticketId, productId, qty) => patch((s) => {
				const ticket = s.services.find((t) => t.id === ticketId);
				const prod = s.products.find((p) => p.id === productId);
				if (!ticket || !prod) return s;
				const safeQty = Math.max(1, Math.floor(qty));
				const existing = ticket.parts.find((x) => x.productId === productId);
				const onHand = s.inventory.find((i) => i.productId === productId)?.onHand ?? 0;
				const used = existing ? Math.min(existing.qty + safeQty, Math.max(0, onHand + (existing?.qty ?? 0))) : Math.min(safeQty, onHand);
				return {
					...s,
					services: s.services.map((t) => t.id === ticketId ? {
						...t,
						parts: existing ? t.parts.map((x) => x.productId === productId ? {
							...x,
							qty: used
						} : x) : [...t.parts, {
							productId,
							name: prod.name,
							qty: used,
							price: prod.price
						}]
					} : t),
					inventory: s.inventory.map((i) => i.productId === productId ? {
						...i,
						onHand: Math.max(0, i.onHand - used + (existing?.qty ?? 0))
					} : i),
					movements: [{
						id: `mv-${Math.random().toString(36).slice(2, 9)}`,
						productId,
						type: "adjusted",
						qty: -used,
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: s.user?.name ?? "Demo User",
						note: `Parts used on ${ticketId}`
					}, ...s.movements],
					auditLogs: log(s, `used ${used}× ${prod.name} on ${ticketId}`, ticketId)
				};
			}),
			removeServicePart: (ticketId, productId) => patch((s) => {
				const ticket = s.services.find((t) => t.id === ticketId);
				const part = ticket?.parts.find((x) => x.productId === productId);
				if (!ticket || !part) return s;
				return {
					...s,
					services: s.services.map((t) => t.id === ticketId ? {
						...t,
						parts: t.parts.filter((x) => x.productId !== productId)
					} : t),
					inventory: s.inventory.map((i) => i.productId === productId ? {
						...i,
						onHand: i.onHand + part.qty
					} : i),
					movements: [{
						id: `mv-${Math.random().toString(36).slice(2, 9)}`,
						productId,
						type: "received",
						qty: part.qty,
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: s.user?.name ?? "Demo User",
						note: `Part unassigned from ${ticketId}`
					}, ...s.movements],
					auditLogs: log(s, `removed ${part.qty}× ${part.name} from ${ticketId}`, ticketId)
				};
			}),
			adjustStock: (productId, delta, note) => patch((s) => ({
				...s,
				inventory: s.inventory.map((i) => i.productId === productId ? {
					...i,
					onHand: Math.max(0, i.onHand + delta)
				} : i),
				movements: [{
					id: `mv-${Math.random().toString(36).slice(2, 9)}`,
					productId,
					type: delta >= 0 ? "received" : "adjusted",
					qty: delta,
					at: (/* @__PURE__ */ new Date()).toISOString(),
					actor: s.user?.name ?? "Demo User",
					note
				}, ...s.movements],
				auditLogs: log(s, `adjusted stock (${delta > 0 ? "+" : ""}${delta})`, productId)
			})),
			createClaim: (warrantyId, reason) => {
				const claim = {
					id: `WC-${Math.floor(Math.random() * 900 + 3100)}`,
					warrantyId,
					reason,
					status: "open",
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					timeline: [{
						label: `Claim opened — ${reason}`,
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor: state.user?.name
					}]
				};
				patch((s) => ({
					...s,
					claims: [claim, ...s.claims],
					auditLogs: log(s, `created warranty claim ${claim.id}`, warrantyId)
				}));
				return claim;
			},
			updateClaim: (claimId, p, label) => patch((s) => {
				if (!s.claims.find((c) => c.id === claimId)) return s;
				const at = (/* @__PURE__ */ new Date()).toISOString();
				const event = {
					label: label ?? (p.status ? `Status set to ${p.status.replace(/_/g, " ")}` : "Claim updated"),
					at,
					actor: s.user?.name
				};
				return {
					...s,
					claims: s.claims.map((c) => c.id === claimId ? {
						...c,
						...p,
						timeline: [...c.timeline, event]
					} : c),
					auditLogs: log(s, `updated warranty claim ${claimId}`, claimId)
				};
			}),
			audit: (action, entity) => patch((s) => ({
				...s,
				auditLogs: log(s, action, entity)
			})),
			markAllNotificationsRead: () => patch((s) => ({
				...s,
				notifications: s.notifications.map((n) => ({
					...n,
					read: true
				}))
			})),
			resetDemoData: () => patch((s) => ({
				...seed$1(),
				user: s.user,
				sidebarCollapsed: s.sidebarCollapsed
			}))
		};
	}, [
		state,
		hydrated,
		productById,
		invFor,
		availableOf,
		customerById,
		categoryById,
		categoryNameOf,
		patch
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
	});
}
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
	return ctx;
}
/** Simulates network latency so skeleton/loading states are exercised. */
function useSimulatedLoad(ms = 320) {
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setLoading(false), ms);
		return () => clearTimeout(t);
	}, [ms]);
	return loading;
}
var ASSEMBLY_STAGES = [
	{
		id: "consultation",
		label: "Consultation",
		group: "sales"
	},
	{
		id: "quote",
		label: "Quote",
		group: "sales"
	},
	{
		id: "approved",
		label: "Approved",
		group: "sales"
	},
	{
		id: "parts_reserved",
		label: "Parts reserved",
		group: "sales"
	},
	{
		id: "assembly",
		label: "Assembly",
		group: "assembly"
	},
	{
		id: "cable_management",
		label: "Cable management",
		group: "assembly"
	},
	{
		id: "bios",
		label: "BIOS / firmware",
		group: "assembly"
	},
	{
		id: "os_install",
		label: "OS installation",
		group: "assembly"
	},
	{
		id: "drivers",
		label: "Driver installation",
		group: "assembly"
	},
	{
		id: "testing",
		label: "Testing",
		group: "validation"
	},
	{
		id: "qa",
		label: "QA",
		group: "validation"
	},
	{
		id: "ready",
		label: "Ready",
		group: "handover"
	},
	{
		id: "release",
		label: "Pickup / delivery",
		group: "handover"
	},
	{
		id: "released",
		label: "Released",
		group: "handover"
	}
];
/**
* Bidirectional map between the build "status" (sales-facing, main store)
* and the assembly "stage" (technician-facing, ops store). These two views
* live in separate demo stores, so every change on one side must be
* mirrored onto the other to keep boards and status badges consistent.
*
* DEMO ONLY — a real backend would expose a single state machine.
*/
var STAGE_TO_STATUS = {
	consultation: "consultation",
	quote: "quoted",
	approved: "approved",
	parts_reserved: "parts_reserved",
	assembly: "assembly",
	cable_management: "assembly",
	bios: "assembly",
	os_install: "assembly",
	drivers: "assembly",
	testing: "testing",
	qa: "testing",
	ready: "ready",
	release: "ready",
	released: "released"
};
var STATUS_TO_STAGE = {
	consultation: "consultation",
	quoted: "quote",
	approved: "approved",
	parts_reserved: "parts_reserved",
	assembly: "assembly",
	testing: "testing",
	ready: "ready",
	released: "released"
};
/** Status for a stage — returns undefined so cancelled/draft states are never overwritten. */
function statusForStage(stage) {
	return STAGE_TO_STATUS[stage];
}
/** Stage for a status — falls back to the previous stage when a status has no stage. */
function stageForStatus(status, currentStage) {
	return STATUS_TO_STAGE[status] ?? currentStage;
}
/**
* DPC NEXUS — operations state container (Phase 2).
*
* Sits beside StoreProvider and owns purchasing, receiving, returns, cashier
* shifts, consultations, tasks, staff and build assembly/QA/release state.
* Persisted to localStorage; swap the action bodies for API calls when a
* backend lands. DEMO ONLY.
*/
var STORAGE_KEY = "dpc-nexus-ops-v1";
/**
* Bump when the persisted snapshot shape changes incompatibly so that stale
* localStorage from an older app version is discarded and re-seeded instead
* of crashing the UI.
*/
var SCHEMA_VERSION = 2;
function seed() {
	return {
		schemaVersion: SCHEMA_VERSION,
		suppliers: structuredClone(suppliers),
		purchaseOrders: structuredClone(purchaseOrders),
		receipts: structuredClone(goodsReceipts),
		returns: structuredClone(returnRequests),
		shifts: structuredClone(shifts),
		consultations: structuredClone(consultations),
		tasks: structuredClone(tasks),
		staff: structuredClone(staff),
		buildOps: structuredClone(buildOps),
		releases: structuredClone(releases),
		counters: {
			po: 147,
			gr: 320,
			rma: 216,
			shift: 483,
			task: 10487,
			cons: 10487,
			rel: 313
		}
	};
}
var uid = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
function defaultBuildOps(buildId) {
	return {
		buildId,
		stage: "consultation",
		assembly: [
			"CPU installed",
			"Cooler mounted",
			"RAM installed",
			"Storage installed",
			"Motherboard seated",
			"PSU installed",
			"GPU installed",
			"Cable management",
			"Front panel wiring"
		].map((label) => ({
			label,
			done: false
		})),
		tests: [
			"CPU stress test",
			"GPU stress test",
			"Memory test",
			"Thermal test",
			"Stability test"
		].map((label) => ({
			label,
			result: null
		})),
		technician: "Unassigned",
		qaStaff: "Unassigned"
	};
}
function stageProgress(stage) {
	const i = ASSEMBLY_STAGES.findIndex((s) => s.id === stage);
	return Math.round((i + 1) / ASSEMBLY_STAGES.length * 100);
}
var Ctx = (0, import_react.createContext)(null);
function OpsProvider({ children, actor = "Demo User" }) {
	const [state, setState] = (0, import_react.useState)(() => seed());
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const skip = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed.schemaVersion === SCHEMA_VERSION) setState((prev) => ({
					...prev,
					...parsed
				}));
				else localStorage.removeItem(STORAGE_KEY);
			}
		} catch {}
		skip.current = false;
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (skip.current) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch {}
	}, [state]);
	const patch = (0, import_react.useCallback)((fn) => setState(fn), []);
	(0, import_react.useEffect)(() => onBuildStatus((buildId, status) => {
		patch((s) => ({
			...s,
			buildOps: upsertOps(s.buildOps, buildId, (o) => ({
				...o,
				stage: stageForStatus(status, o.stage)
			}))
		}));
	}), [patch]);
	const value = (0, import_react.useMemo)(() => {
		const find = (list, id) => list.find((x) => x.id === id);
		return {
			...state,
			hydrated,
			actor,
			supplierById: (id) => find(state.suppliers, id),
			poById: (id) => find(state.purchaseOrders, id),
			receiptById: (id) => find(state.receipts, id),
			returnById: (id) => find(state.returns, id),
			consultationById: (id) => find(state.consultations, id),
			opsForBuild: (buildId) => state.buildOps.find((b) => b.buildId === buildId) ?? defaultBuildOps(buildId),
			openShift: state.shifts.find((s) => s.status === "open"),
			setPoStatus: (id, status) => patch((s) => ({
				...s,
				purchaseOrders: s.purchaseOrders.map((p) => p.id === id ? {
					...p,
					status,
					receivedAt: status === "received" ? (/* @__PURE__ */ new Date()).toISOString() : p.receivedAt
				} : p)
			})),
			createSupplier: (data) => {
				const supplier = {
					...data,
					id: `sup-${Math.random().toString(36).slice(2, 9)}`,
					rating: 0,
					status: "active"
				};
				patch((s) => ({
					...s,
					suppliers: [supplier, ...s.suppliers]
				}));
				return supplier;
			},
			updateSupplier: (id, p) => patch((s) => ({
				...s,
				suppliers: s.suppliers.map((sp) => sp.id === id ? {
					...sp,
					...p
				} : sp)
			})),
			createPurchaseOrder: ({ supplierId, lines, expectedAt, notes }) => {
				const supplier = find(state.suppliers, supplierId);
				if (!supplier || lines.length === 0) return null;
				const order = {
					id: `PO-2026-${String(state.counters.po).padStart(5, "0")}`,
					supplierId,
					supplierName: supplier.name,
					status: "draft",
					lines: lines.map((l) => ({
						...l,
						received: 0
					})),
					total: lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					expectedAt,
					createdBy: actor,
					notes
				};
				patch((s) => ({
					...s,
					purchaseOrders: [order, ...s.purchaseOrders],
					counters: {
						...s.counters,
						po: s.counters.po + 1
					}
				}));
				return order;
			},
			startReceipt: (purchaseOrderId) => {
				const po = find(state.purchaseOrders, purchaseOrderId);
				if (!po) return null;
				const existing = state.receipts.find((r) => r.purchaseOrderId === purchaseOrderId && r.status === "in_progress");
				if (existing) return existing;
				const receipt = {
					id: `GR-${String(state.counters.gr).padStart(5, "0")}`,
					purchaseOrderId,
					supplierId: po.supplierId,
					supplierName: po.supplierName,
					status: "in_progress",
					receivedBy: actor,
					receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
					lines: po.lines.map((l) => ({
						productId: l.productId,
						name: l.name,
						sku: l.sku,
						expected: l.qty - l.received,
						received: 0,
						damaged: 0,
						serials: []
					}))
				};
				patch((s) => ({
					...s,
					receipts: [receipt, ...s.receipts],
					counters: {
						...s.counters,
						gr: s.counters.gr + 1
					}
				}));
				return receipt;
			},
			updateReceiptLine: (receiptId, productId, p) => patch((s) => ({
				...s,
				receipts: s.receipts.map((r) => r.id === receiptId ? {
					...r,
					lines: r.lines.map((l) => l.productId === productId ? {
						...l,
						...p,
						received: p.received !== void 0 ? Math.max(0, Math.min(l.expected, p.received)) : l.received
					} : l)
				} : r)
			})),
			setReceiptNotes: (receiptId, notes) => patch((s) => ({
				...s,
				receipts: s.receipts.map((r) => r.id === receiptId ? {
					...r,
					notes
				} : r)
			})),
			completeReceipt: (receiptId, onStock, onSerials) => {
				const receipt = find(state.receipts, receiptId);
				if (!receipt) return;
				const discrepancy = receipt.lines.some((l) => l.received !== l.expected || l.damaged > 0);
				receipt.lines.forEach((l) => {
					const good = Math.max(0, l.received - l.damaged);
					if (good > 0) onStock(l.productId, good, receipt.id);
				});
				if (onSerials) receipt.lines.forEach((l) => {
					if (l.serials.length > 0) onSerials(l.productId, l.serials, receipt.id);
				});
				patch((s) => ({
					...s,
					receipts: s.receipts.map((r) => r.id === receiptId ? {
						...r,
						status: discrepancy ? "discrepancy" : "completed",
						receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
						receivedBy: actor
					} : r),
					purchaseOrders: s.purchaseOrders.map((p) => {
						if (p.id !== receipt.purchaseOrderId) return p;
						const lines = p.lines.map((pl) => {
							const rl = receipt.lines.find((l) => l.productId === pl.productId);
							return rl ? {
								...pl,
								received: Math.min(pl.qty, pl.received + rl.received)
							} : pl;
						});
						const complete = lines.every((l) => l.received >= l.qty);
						return {
							...p,
							lines,
							status: complete ? "received" : "partial",
							receivedAt: complete ? (/* @__PURE__ */ new Date()).toISOString() : p.receivedAt
						};
					})
				}));
			},
			createReturn: (data) => {
				const id = `RMA-${String(state.counters.rma).padStart(5, "0")}`;
				const req = {
					...data,
					id,
					status: "requested",
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				patch((s) => ({
					...s,
					returns: [req, ...s.returns],
					counters: {
						...s.counters,
						rma: s.counters.rma + 1
					}
				}));
				return req;
			},
			setReturnStatus: (id, status, p = {}) => patch((s) => ({
				...s,
				returns: s.returns.map((r) => r.id === id ? {
					...r,
					...p,
					status
				} : r)
			})),
			updateReturn: (id, p) => patch((s) => ({
				...s,
				returns: s.returns.map((r) => r.id === id ? {
					...r,
					...p
				} : r)
			})),
			openNewShift: (openingCash, cashier) => {
				const shift = {
					id: `SH-${String(state.counters.shift).padStart(5, "0")}`,
					cashier,
					status: "open",
					openedAt: (/* @__PURE__ */ new Date()).toISOString(),
					openingCash,
					adjustments: []
				};
				patch((s) => ({
					...s,
					shifts: [shift, ...s.shifts.map((x) => x.status === "open" ? {
						...x,
						status: "closed",
						closedAt: (/* @__PURE__ */ new Date()).toISOString()
					} : x)],
					counters: {
						...s.counters,
						shift: s.counters.shift + 1
					}
				}));
				return shift;
			},
			addCashAdjustment: (shiftId, a) => patch((s) => ({
				...s,
				shifts: s.shifts.map((sh) => sh.id === shiftId ? {
					...sh,
					adjustments: [{
						...a,
						id: uid("ca"),
						at: (/* @__PURE__ */ new Date()).toISOString(),
						actor
					}, ...sh.adjustments]
				} : sh)
			})),
			closeShift: (shiftId, countedCash, tenders, refunds, notes) => patch((s) => ({
				...s,
				shifts: s.shifts.map((sh) => sh.id === shiftId ? {
					...sh,
					status: "closed",
					closedAt: (/* @__PURE__ */ new Date()).toISOString(),
					countedCash,
					tenders,
					refunds,
					notes
				} : sh)
			})),
			createConsultation: (data) => {
				const id = `CONS-${state.counters.cons}`;
				const c = {
					status: "new",
					...data,
					id,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				patch((s) => ({
					...s,
					consultations: [c, ...s.consultations],
					counters: {
						...s.counters,
						cons: s.counters.cons + 1
					}
				}));
				return c;
			},
			updateConsultation: (id, p) => patch((s) => ({
				...s,
				consultations: s.consultations.map((c) => c.id === id ? {
					...c,
					...p
				} : c)
			})),
			createTask: (data) => {
				const id = `TASK-${state.counters.task}`;
				const t = {
					status: "todo",
					...data,
					id,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				patch((s) => ({
					...s,
					tasks: [t, ...s.tasks],
					counters: {
						...s.counters,
						task: s.counters.task + 1
					}
				}));
				return t;
			},
			setTaskStatus: (id, status) => patch((s) => ({
				...s,
				tasks: s.tasks.map((t) => t.id === id ? {
					...t,
					status
				} : t)
			})),
			assignTask: (id, assignee) => patch((s) => ({
				...s,
				tasks: s.tasks.map((t) => t.id === id ? {
					...t,
					assignee
				} : t)
			})),
			updateTask: (id, p) => patch((s) => ({
				...s,
				tasks: s.tasks.map((t) => t.id === id ? {
					...t,
					...p
				} : t)
			})),
			deleteTask: (id) => patch((s) => ({
				...s,
				tasks: s.tasks.filter((t) => t.id !== id)
			})),
			createStaff: (data) => {
				const staff = {
					...data,
					id: `st-${Math.random().toString(36).slice(2, 9)}`,
					status: "available",
					completed: 0
				};
				patch((s) => ({
					...s,
					staff: [staff, ...s.staff]
				}));
				return staff;
			},
			updateStaff: (id, p) => patch((s) => ({
				...s,
				staff: s.staff.map((m) => m.id === id ? {
					...m,
					...p
				} : m)
			})),
			setBuildStage: (buildId, stage) => patch((s) => ({
				...s,
				buildOps: upsertOps(s.buildOps, buildId, (o) => ({
					...o,
					stage
				}))
			})),
			toggleAssemblyStep: (buildId, label, done) => patch((s) => ({
				...s,
				buildOps: upsertOps(s.buildOps, buildId, (o) => ({
					...o,
					assembly: o.assembly.map((a) => a.label === label ? {
						...a,
						done
					} : a)
				}))
			})),
			setTestResult: (buildId, label, result, reading) => patch((s) => ({
				...s,
				buildOps: upsertOps(s.buildOps, buildId, (o) => ({
					...o,
					tests: o.tests.map((t) => t.label === label ? {
						...t,
						result,
						reading: reading ?? t.reading
					} : t)
				}))
			})),
			signQa: (buildId, qaStaff) => patch((s) => ({
				...s,
				buildOps: upsertOps(s.buildOps, buildId, (o) => ({
					...o,
					qaStaff,
					qaSignedAt: (/* @__PURE__ */ new Date()).toISOString(),
					stage: o.tests.every((t) => t.result === "pass") ? "ready" : o.stage
				}))
			})),
			assignBuildStaff: (buildId, p) => patch((s) => ({
				...s,
				buildOps: upsertOps(s.buildOps, buildId, (o) => ({
					...o,
					...p
				}))
			})),
			createRelease: (data) => {
				const rec = {
					...data,
					id: `REL-${String(state.counters.rel).padStart(5, "0")}`,
					status: "scheduled"
				};
				patch((s) => ({
					...s,
					releases: [rec, ...s.releases],
					counters: {
						...s.counters,
						rel: s.counters.rel + 1
					}
				}));
				return rec;
			},
			markReleaseReleased: (id, releasedBy) => patch((s) => ({
				...s,
				releases: s.releases.map((r) => r.id === id && r.status === "scheduled" ? {
					...r,
					status: "released",
					releasedBy,
					releasedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : r)
			})),
			completeRelease: (id, receivedBy) => patch((s) => ({
				...s,
				releases: s.releases.map((r) => r.id === id && r.status === "released" ? {
					...r,
					status: "completed",
					receivedBy,
					completedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : r)
			})),
			resetOpsData: () => patch(() => seed())
		};
	}, [
		state,
		hydrated,
		actor,
		patch
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function upsertOps(list, buildId, fn) {
	if (!list.find((o) => o.buildId === buildId)) return [fn(defaultBuildOps(buildId)), ...list];
	return list.map((o) => o.buildId === buildId ? fn(o) : o);
}
function useOps() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useOps must be used inside <OpsProvider>");
	return ctx;
}
/** Expected cash in drawer for a shift, given cash sales and refunds. */
function expectedCash(shift, cashSales, cashRefunds = 0) {
	const adjustments = shift.adjustments.reduce((sum, a) => sum + (a.kind === "cash_in" ? a.amount : -a.amount), 0);
	return shift.openingCash + cashSales + adjustments - cashRefunds;
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-tech",
					children: "Error 404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-xl font-semibold text-foreground",
					children: "Route not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "This screen doesn't exist in DPC Nexus, or it has moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/dashboard",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Back to dashboard"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-tech",
					children: "System error"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-xl font-semibold tracking-tight text-foreground",
					children: "This screen didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. Retry, or head back to the dashboard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$43 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "DPC Nexus — PC Retail & Operations Platform" },
			{
				name: "description",
				content: "DPC Nexus is the operational command center for Dream PC Build & IT Solutions — POS, inventory, custom builds, service and warranty."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "robots",
				content: "noindex"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$43.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
			delayDuration: 200,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "bottom-right" })]
		}) }) })
	});
}
var $$splitComponentImporter$42 = () => import("./routes-CYqjX8P9.mjs");
var Route$42 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Sign in — DPC Nexus" },
		{
			name: "description",
			content: "Sign in to DPC Nexus, the PC retail and operations platform for Dream PC Build & IT Solutions."
		},
		{
			property: "og:title",
			content: "Sign in — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Internal operations platform for a PC custom-build and IT solutions business."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$42, "component")
});
var $$splitComponentImporter$41 = () => import("../_app-C0pwzSvJ.mjs");
var Route$41 = createFileRoute("/_app")({ component: lazyRouteComponent($$splitComponentImporter$41, "component") });
var $$splitComponentImporter$40 = () => import("../_app.assembly-BcHKrjcs.mjs");
var Route$40 = createFileRoute("/_app/assembly")({
	head: () => ({ meta: [
		{ title: "Assembly Workspace — DPC Nexus" },
		{
			name: "description",
			content: "Technician kanban board for custom build assembly, testing and QA."
		},
		{
			property: "og:title",
			content: "Assembly Workspace — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Technician kanban board for custom build assembly, testing and QA."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$40, "component")
});
var $$splitComponentImporter$39 = () => import("../_app.audit-Dy0-Dg2T.mjs");
var Route$39 = createFileRoute("/_app/audit")({
	head: () => ({ meta: [
		{ title: "Audit Log — DPC Nexus" },
		{
			name: "description",
			content: "Read-only record of system activity."
		},
		{
			property: "og:title",
			content: "Audit Log — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Read-only record of system activity."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$39, "component")
});
var $$splitComponentImporter$38 = () => import("../_app.dashboard-qwSJRHD8.mjs");
var Route$38 = createFileRoute("/_app/dashboard")({
	head: () => ({ meta: [
		{ title: "Operations Dashboard — DPC Nexus" },
		{
			name: "description",
			content: "Today's sales, build pipeline, stock alerts and recent activity for Dream PC Build & IT Solutions."
		},
		{
			property: "og:title",
			content: "Operations Dashboard — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Live operational overview: sales, builds, inventory alerts and activity."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
/** Small mono telemetry chip used in the command-center status strip. */
var $$splitComponentImporter$37 = () => import("../_app.documents-CwhqQS0o.mjs");
var Route$37 = createFileRoute("/_app/documents")({
	head: () => ({ meta: [
		{ title: "Documents — DPC Nexus" },
		{
			name: "description",
			content: "Receipts, invoices, quotations and release documents."
		},
		{
			property: "og:title",
			content: "Documents — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Receipts, invoices, quotations and release documents."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$37, "component")
});
var $$splitComponentImporter$36 = () => import("../_app.pos-DVn_KGWN.mjs");
var Route$36 = createFileRoute("/_app/pos")({
	head: () => ({ meta: [
		{ title: "Point of Sale — DPC Nexus" },
		{
			name: "description",
			content: "Ring up walk-in sales, apply discounts and take payment."
		},
		{
			property: "og:title",
			content: "Point of Sale — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Ring up walk-in sales, apply discounts and take payment."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("../_app.reports-CINJhxAE.mjs");
var Route$35 = createFileRoute("/_app/reports")({
	head: () => ({ meta: [
		{ title: "Reports — DPC Nexus" },
		{
			name: "description",
			content: "Sales, margin, inventory turnover and technician output."
		},
		{
			property: "og:title",
			content: "Reports — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Sales, margin, inventory turnover and technician output."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("../_app.serials-DsOvW0nL.mjs");
var Route$34 = createFileRoute("/_app/serials")({
	validateSearch: (search) => ({ serial: typeof search["serial"] === "string" ? search["serial"] : void 0 }),
	head: () => ({ meta: [
		{ title: "Serial Numbers — DPC Nexus" },
		{
			name: "description",
			content: "Unit-level traceability from receiving through sale, build and warranty."
		},
		{
			property: "og:title",
			content: "Serial Numbers — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Unit-level traceability from receiving through sale, build and warranty."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
var $$splitComponentImporter$33 = () => import("../_app.settings-2HOIIILS.mjs");
var Route$33 = createFileRoute("/_app/settings")({
	head: () => ({ meta: [
		{ title: "Settings — DPC Nexus" },
		{
			name: "description",
			content: "Store profile, appearance, tax, roles, notifications and demo system info."
		},
		{
			property: "og:title",
			content: "Settings — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Store profile, appearance, tax, roles, notifications and demo system info."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("../_app.staff-BNdU-wiy.mjs");
var Route$32 = createFileRoute("/_app/staff")({
	head: () => ({ meta: [
		{ title: "Staff & Assignments — DPC Nexus" },
		{
			name: "description",
			content: "Technician workload and operational assignments."
		},
		{
			property: "og:title",
			content: "Staff & Assignments — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Technician workload and operational assignments."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("../_app.tasks-Ce4WgGCm.mjs");
var Route$31 = createFileRoute("/_app/tasks")({
	head: () => ({ meta: [
		{ title: "Tasks — DPC Nexus" },
		{
			name: "description",
			content: "Operational tasks across builds, services and receiving."
		},
		{
			property: "og:title",
			content: "Tasks — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Operational tasks across builds, services and receiving."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("../_app.builds.index-Bn0j1Y63.mjs");
var Route$30 = createFileRoute("/_app/builds/")({
	head: () => ({ meta: [
		{ title: "Custom Builds — DPC Nexus" },
		{
			name: "description",
			content: "Build pipeline from consultation through QA to release."
		},
		{
			property: "og:title",
			content: "Custom Builds — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Build pipeline from consultation through QA to release."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("../_app.builds._buildId-9TlF5Hlp.mjs");
var Route$29 = createFileRoute("/_app/builds/$buildId")({
	head: () => ({ meta: [
		{ title: "Build detail — DPC Nexus" },
		{
			name: "description",
			content: "Parts list, compatibility checks, QA results and timeline."
		},
		{
			property: "og:title",
			content: "Build detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Parts list, compatibility checks, QA results and timeline."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("../_app.consultations.index-DWIGqlZ_.mjs");
var Route$28 = createFileRoute("/_app/consultations/")({
	validateSearch: (search) => ({ openNew: search["new"] === "1" || search["new"] === true }),
	head: () => ({ meta: [
		{ title: "Consultations — DPC Nexus" },
		{
			name: "description",
			content: "Customer build consultations and requirements capture."
		},
		{
			property: "og:title",
			content: "Consultations — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Customer build consultations and requirements capture."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("../_app.consultations._consultationId-2LAlp7YV.mjs");
var Route$27 = createFileRoute("/_app/consultations/$consultationId")({
	head: () => ({ meta: [
		{ title: "Consultation — DPC Nexus" },
		{
			name: "description",
			content: "Requirements, recommendation and conversion path."
		},
		{
			property: "og:title",
			content: "Consultation — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Requirements, recommendation and conversion path."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("../_app.customers.index-D3vqZs_J.mjs");
var Route$26 = createFileRoute("/_app/customers/")({
	validateSearch: (search) => ({ openNew: search["new"] === "1" || search["new"] === true }),
	head: () => ({ meta: [
		{ title: "Customers — DPC Nexus" },
		{
			name: "description",
			content: "Customer directory with purchase and service history."
		},
		{
			property: "og:title",
			content: "Customers — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Customer directory with purchase and service history."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("../_app.customers._customerId-EAQZwgoM.mjs");
var Route$25 = createFileRoute("/_app/customers/$customerId")({
	head: () => ({ meta: [
		{ title: "Customer detail — DPC Nexus" },
		{
			name: "description",
			content: "Profile, owned systems, orders and tickets."
		},
		{
			property: "og:title",
			content: "Customer detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Profile, owned systems, orders and tickets."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("../_app.inventory.index-B0lvZznt.mjs");
var Route$24 = createFileRoute("/_app/inventory/")({
	head: () => ({ meta: [
		{ title: "Inventory — DPC Nexus" },
		{
			name: "description",
			content: "Stock on hand, reserved units, reorder points and serials."
		},
		{
			property: "og:title",
			content: "Inventory — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Stock on hand, reserved units, reorder points and serials."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("../_app.inventory._productId-CYQUvjdw.mjs");
var Route$23 = createFileRoute("/_app/inventory/$productId")({
	head: () => ({ meta: [
		{ title: "Stock Item — DPC Nexus" },
		{
			name: "description",
			content: "Stock levels, movements and serial numbers for one product."
		},
		{
			property: "og:title",
			content: "Stock Item — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Stock levels, movements and serial numbers for one product."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("../_app.orders.index-3Qc3H7hE.mjs");
var Route$22 = createFileRoute("/_app/orders/")({
	head: () => ({ meta: [
		{ title: "Orders — DPC Nexus" },
		{
			name: "description",
			content: "Transaction history with payment and fulfillment status."
		},
		{
			property: "og:title",
			content: "Orders — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Transaction history with payment and fulfillment status."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("../_app.orders._orderId-DJwCb2PE.mjs");
var Route$21 = createFileRoute("/_app/orders/$orderId")({
	head: () => ({ meta: [
		{ title: "Order detail — DPC Nexus" },
		{
			name: "description",
			content: "Line items, payment breakdown and receipt actions."
		},
		{
			property: "og:title",
			content: "Order detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Line items, payment breakdown and receipt actions."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("../_app.products.index-BbqqXmc9.mjs");
var Route$20 = createFileRoute("/_app/products/")({
	validateSearch: (search) => ({ openNew: search["new"] === "1" || search["new"] === true }),
	head: () => ({ meta: [
		{ title: "Products — DPC Nexus" },
		{
			name: "description",
			content: "Catalog of components, peripherals and prebuilt systems."
		},
		{
			property: "og:title",
			content: "Products — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Catalog of components, peripherals and prebuilt systems."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("../_app.products._productId-rDMxmtzb.mjs");
var Route$19 = createFileRoute("/_app/products/$productId")({
	head: () => ({ meta: [
		{ title: "Product detail — DPC Nexus" },
		{
			name: "description",
			content: "Specifications, pricing, stock and movement history."
		},
		{
			property: "og:title",
			content: "Product detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Specifications, pricing, stock and movement history."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("../_app.purchasing.index-ClBpRc_n.mjs");
var Route$18 = createFileRoute("/_app/purchasing/")({
	head: () => ({ meta: [
		{ title: "Purchasing — DPC Nexus" },
		{
			name: "description",
			content: "Purchase orders, supplier commitments and expected deliveries."
		},
		{
			property: "og:title",
			content: "Purchasing — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Purchase orders, supplier commitments and expected deliveries."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("../_app.purchasing._poId-B92h3mS8.mjs");
var Route$17 = createFileRoute("/_app/purchasing/$poId")({
	head: () => ({ meta: [
		{ title: "Purchase Order — DPC Nexus" },
		{
			name: "description",
			content: "Purchase order lines, costs and receiving progress."
		},
		{
			property: "og:title",
			content: "Purchase Order — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Purchase order lines, costs and receiving progress."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("../_app.quotes.index-BYqnPZcm.mjs");
var Route$16 = createFileRoute("/_app/quotes/")({
	head: () => ({ meta: [
		{ title: "Quotes — DPC Nexus" },
		{
			name: "description",
			content: "Quotations, validity windows and conversion to orders."
		},
		{
			property: "og:title",
			content: "Quotes — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Quotations, validity windows and conversion to orders."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("../_app.quotes._quoteId-CBqMsm07.mjs");
var Route$15 = createFileRoute("/_app/quotes/$quoteId")({
	head: () => ({ meta: [
		{ title: "Quote detail — DPC Nexus" },
		{
			name: "description",
			content: "Quoted configuration, totals and approval state."
		},
		{
			property: "og:title",
			content: "Quote detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Quoted configuration, totals and approval state."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("../_app.receiving.index-CT8h7wgc.mjs");
var Route$14 = createFileRoute("/_app/receiving/")({
	head: () => ({ meta: [
		{ title: "Stock Receiving — DPC Nexus" },
		{
			name: "description",
			content: "Goods receipts against purchase orders."
		},
		{
			property: "og:title",
			content: "Stock Receiving — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Goods receipts against purchase orders."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("../_app.receiving._receiptId-DRrSNA5W.mjs");
var Route$13 = createFileRoute("/_app/receiving/$receiptId")({
	head: () => ({ meta: [
		{ title: "Goods Receipt — DPC Nexus" },
		{
			name: "description",
			content: "Receive items, record damage and capture serial numbers."
		},
		{
			property: "og:title",
			content: "Goods Receipt — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Receive items, record damage and capture serial numbers."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("../_app.releases.index-CtcXFXyQ.mjs");
var Route$12 = createFileRoute("/_app/releases/")({
	head: () => ({ meta: [
		{ title: "Delivery & Release — DPC Nexus" },
		{
			name: "description",
			content: "Pickup and delivery handover for builds and services."
		},
		{
			property: "og:title",
			content: "Delivery & Release — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Pickup and delivery handover for builds and services."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("../_app.releases._releaseId-BHm-5lmP.mjs");
var Route$11 = createFileRoute("/_app/releases/$releaseId")({
	head: () => ({ meta: [
		{ title: "Release detail — DPC Nexus" },
		{
			name: "description",
			content: "Pickup and delivery handover record."
		},
		{
			property: "og:title",
			content: "Release detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Pickup and delivery handover record."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("../_app.returns.index-Drs30C9f.mjs");
var Route$10 = createFileRoute("/_app/returns/")({
	head: () => ({ meta: [
		{ title: "Returns & Refunds — DPC Nexus" },
		{
			name: "description",
			content: "Return requests, inspection outcomes and refunds."
		},
		{
			property: "og:title",
			content: "Returns & Refunds — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Return requests, inspection outcomes and refunds."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("../_app.returns._returnId-C02nEkra.mjs");
var Route$9 = createFileRoute("/_app/returns/$returnId")({
	head: () => ({ meta: [
		{ title: "Return Request — DPC Nexus" },
		{
			name: "description",
			content: "Inspection, approval and refund workflow for a return."
		},
		{
			property: "og:title",
			content: "Return Request — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Inspection, approval and refund workflow for a return."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
/** Frontend-only lifecycle used to render the RMA progress timeline. */
var $$splitComponentImporter$8 = () => import("../_app.services.index-7CCbZ8wC.mjs");
var Route$8 = createFileRoute("/_app/services/")({
	validateSearch: (search) => ({ openNew: search["new"] === "1" || search["new"] === true }),
	head: () => ({ meta: [
		{ title: "Service Tickets — DPC Nexus" },
		{
			name: "description",
			content: "Repairs, diagnostics and upgrade jobs."
		},
		{
			property: "og:title",
			content: "Service Tickets — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Repairs, diagnostics and upgrade jobs."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("../_app.services._ticketId-Dx8Xc6UP.mjs");
var Route$7 = createFileRoute("/_app/services/$ticketId")({
	head: () => ({ meta: [
		{ title: "Ticket detail — DPC Nexus" },
		{
			name: "description",
			content: "Diagnosis, parts used, labor and status timeline."
		},
		{
			property: "og:title",
			content: "Ticket detail — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Diagnosis, parts used, labor and status timeline."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_app.shifts.index-UDEExolC.mjs");
var Route$6 = createFileRoute("/_app/shifts/")({
	head: () => ({ meta: [
		{ title: "Cash Drawer — DPC Nexus" },
		{
			name: "description",
			content: "Cashier shifts, cash movements and end-of-shift reconciliation."
		},
		{
			property: "og:title",
			content: "Cash Drawer — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Cashier shifts, cash movements and end-of-shift reconciliation."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("../_app.shifts._shiftId-DvPayODF.mjs");
var Route$5 = createFileRoute("/_app/shifts/$shiftId")({
	head: () => ({ meta: [
		{ title: "Shift — DPC Nexus" },
		{
			name: "description",
			content: "Shift detail with tender breakdown and variance."
		},
		{
			property: "og:title",
			content: "Shift — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Shift detail with tender breakdown and variance."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("../_app.suppliers.index-BqqD_pPh.mjs");
var Route$4 = createFileRoute("/_app/suppliers/")({
	head: () => ({ meta: [
		{ title: "Suppliers — DPC Nexus" },
		{
			name: "description",
			content: "Supplier directory, terms and lead times."
		},
		{
			property: "og:title",
			content: "Suppliers — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Supplier directory, terms and lead times."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("../_app.suppliers._supplierId-CY3tB1f0.mjs");
var Route$3 = createFileRoute("/_app/suppliers/$supplierId")({
	head: () => ({ meta: [
		{ title: "Supplier — DPC Nexus" },
		{
			name: "description",
			content: "Supplier profile, purchase history and supplied products."
		},
		{
			property: "og:title",
			content: "Supplier — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Supplier profile, purchase history and supplied products."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("../_app.warranty.index-CZn7hBwL.mjs");
var Route$2 = createFileRoute("/_app/warranty/")({
	head: () => ({ meta: [
		{ title: "Warranty — DPC Nexus" },
		{
			name: "description",
			content: "Warranty registry, coverage windows and claims."
		},
		{
			property: "og:title",
			content: "Warranty — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Warranty registry, coverage windows and claims."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_app.warranty._warrantyId-DSa7jFyl.mjs");
var Route$1 = createFileRoute("/_app/warranty/$warrantyId")({
	head: () => ({ meta: [
		{ title: "Warranty — DPC Nexus" },
		{
			name: "description",
			content: "Coverage, claims and history for one warranty record."
		},
		{
			property: "og:title",
			content: "Warranty — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Coverage, claims and history for one warranty record."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_app.warranty.claims._claimId-OLY53-aJ.mjs");
var Route = createFileRoute("/_app/warranty/claims/$claimId")({
	head: () => ({ meta: [
		{ title: "Claim — DPC Nexus" },
		{
			name: "description",
			content: "Warranty claim workflow and history."
		},
		{
			property: "og:title",
			content: "Claim — DPC Nexus"
		},
		{
			property: "og:description",
			content: "Warranty claim workflow and history."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$42.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$43
});
var AppRoute = Route$41.update({
	id: "/_app",
	getParentRoute: () => Route$43
});
var AppAssemblyRoute = Route$40.update({
	id: "/assembly",
	path: "/assembly",
	getParentRoute: () => AppRoute
});
var AppAuditRoute = Route$39.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AppRoute
});
var AppDashboardRoute = Route$38.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AppRoute
});
var AppDocumentsRoute = Route$37.update({
	id: "/documents",
	path: "/documents",
	getParentRoute: () => AppRoute
});
var AppPosRoute = Route$36.update({
	id: "/pos",
	path: "/pos",
	getParentRoute: () => AppRoute
});
var AppReportsRoute = Route$35.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AppRoute
});
var AppSerialsRoute = Route$34.update({
	id: "/serials",
	path: "/serials",
	getParentRoute: () => AppRoute
});
var AppSettingsRoute = Route$33.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AppRoute
});
var AppStaffRoute = Route$32.update({
	id: "/staff",
	path: "/staff",
	getParentRoute: () => AppRoute
});
var AppTasksRoute = Route$31.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => AppRoute
});
var AppBuildsIndexRoute = Route$30.update({
	id: "/builds/",
	path: "/builds/",
	getParentRoute: () => AppRoute
});
var AppBuildsBuildIdRoute = Route$29.update({
	id: "/builds/$buildId",
	path: "/builds/$buildId",
	getParentRoute: () => AppRoute
});
var AppConsultationsIndexRoute = Route$28.update({
	id: "/consultations/",
	path: "/consultations/",
	getParentRoute: () => AppRoute
});
var AppConsultationsConsultationIdRoute = Route$27.update({
	id: "/consultations/$consultationId",
	path: "/consultations/$consultationId",
	getParentRoute: () => AppRoute
});
var AppCustomersIndexRoute = Route$26.update({
	id: "/customers/",
	path: "/customers/",
	getParentRoute: () => AppRoute
});
var AppCustomersCustomerIdRoute = Route$25.update({
	id: "/customers/$customerId",
	path: "/customers/$customerId",
	getParentRoute: () => AppRoute
});
var AppInventoryIndexRoute = Route$24.update({
	id: "/inventory/",
	path: "/inventory/",
	getParentRoute: () => AppRoute
});
var AppInventoryProductIdRoute = Route$23.update({
	id: "/inventory/$productId",
	path: "/inventory/$productId",
	getParentRoute: () => AppRoute
});
var AppOrdersIndexRoute = Route$22.update({
	id: "/orders/",
	path: "/orders/",
	getParentRoute: () => AppRoute
});
var AppOrdersOrderIdRoute = Route$21.update({
	id: "/orders/$orderId",
	path: "/orders/$orderId",
	getParentRoute: () => AppRoute
});
var AppProductsIndexRoute = Route$20.update({
	id: "/products/",
	path: "/products/",
	getParentRoute: () => AppRoute
});
var AppProductsProductIdRoute = Route$19.update({
	id: "/products/$productId",
	path: "/products/$productId",
	getParentRoute: () => AppRoute
});
var AppPurchasingIndexRoute = Route$18.update({
	id: "/purchasing/",
	path: "/purchasing/",
	getParentRoute: () => AppRoute
});
var AppPurchasingPoIdRoute = Route$17.update({
	id: "/purchasing/$poId",
	path: "/purchasing/$poId",
	getParentRoute: () => AppRoute
});
var AppQuotesIndexRoute = Route$16.update({
	id: "/quotes/",
	path: "/quotes/",
	getParentRoute: () => AppRoute
});
var AppQuotesQuoteIdRoute = Route$15.update({
	id: "/quotes/$quoteId",
	path: "/quotes/$quoteId",
	getParentRoute: () => AppRoute
});
var AppReceivingIndexRoute = Route$14.update({
	id: "/receiving/",
	path: "/receiving/",
	getParentRoute: () => AppRoute
});
var AppReceivingReceiptIdRoute = Route$13.update({
	id: "/receiving/$receiptId",
	path: "/receiving/$receiptId",
	getParentRoute: () => AppRoute
});
var AppReleasesIndexRoute = Route$12.update({
	id: "/releases/",
	path: "/releases/",
	getParentRoute: () => AppRoute
});
var AppReleasesReleaseIdRoute = Route$11.update({
	id: "/releases/$releaseId",
	path: "/releases/$releaseId",
	getParentRoute: () => AppRoute
});
var AppReturnsIndexRoute = Route$10.update({
	id: "/returns/",
	path: "/returns/",
	getParentRoute: () => AppRoute
});
var AppReturnsReturnIdRoute = Route$9.update({
	id: "/returns/$returnId",
	path: "/returns/$returnId",
	getParentRoute: () => AppRoute
});
var AppServicesIndexRoute = Route$8.update({
	id: "/services/",
	path: "/services/",
	getParentRoute: () => AppRoute
});
var AppServicesTicketIdRoute = Route$7.update({
	id: "/services/$ticketId",
	path: "/services/$ticketId",
	getParentRoute: () => AppRoute
});
var AppShiftsIndexRoute = Route$6.update({
	id: "/shifts/",
	path: "/shifts/",
	getParentRoute: () => AppRoute
});
var AppShiftsShiftIdRoute = Route$5.update({
	id: "/shifts/$shiftId",
	path: "/shifts/$shiftId",
	getParentRoute: () => AppRoute
});
var AppSuppliersIndexRoute = Route$4.update({
	id: "/suppliers/",
	path: "/suppliers/",
	getParentRoute: () => AppRoute
});
var AppSuppliersSupplierIdRoute = Route$3.update({
	id: "/suppliers/$supplierId",
	path: "/suppliers/$supplierId",
	getParentRoute: () => AppRoute
});
var AppWarrantyIndexRoute = Route$2.update({
	id: "/warranty/",
	path: "/warranty/",
	getParentRoute: () => AppRoute
});
var AppRouteChildren = {
	AppAssemblyRoute,
	AppAuditRoute,
	AppDashboardRoute,
	AppDocumentsRoute,
	AppPosRoute,
	AppReportsRoute,
	AppSerialsRoute,
	AppSettingsRoute,
	AppStaffRoute,
	AppTasksRoute,
	AppBuildsBuildIdRoute,
	AppConsultationsConsultationIdRoute,
	AppCustomersCustomerIdRoute,
	AppInventoryProductIdRoute,
	AppOrdersOrderIdRoute,
	AppProductsProductIdRoute,
	AppPurchasingPoIdRoute,
	AppQuotesQuoteIdRoute,
	AppReceivingReceiptIdRoute,
	AppReleasesReleaseIdRoute,
	AppReturnsReturnIdRoute,
	AppServicesTicketIdRoute,
	AppShiftsShiftIdRoute,
	AppSuppliersSupplierIdRoute,
	AppWarrantyWarrantyIdRoute: Route$1.update({
		id: "/warranty/$warrantyId",
		path: "/warranty/$warrantyId",
		getParentRoute: () => AppRoute
	}),
	AppBuildsIndexRoute,
	AppConsultationsIndexRoute,
	AppCustomersIndexRoute,
	AppInventoryIndexRoute,
	AppOrdersIndexRoute,
	AppProductsIndexRoute,
	AppPurchasingIndexRoute,
	AppQuotesIndexRoute,
	AppReceivingIndexRoute,
	AppReleasesIndexRoute,
	AppReturnsIndexRoute,
	AppServicesIndexRoute,
	AppShiftsIndexRoute,
	AppSuppliersIndexRoute,
	AppWarrantyIndexRoute,
	AppWarrantyClaimsClaimIdRoute: Route.update({
		id: "/warranty/claims/$claimId",
		path: "/warranty/claims/$claimId",
		getParentRoute: () => AppRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren)
};
var routeTree = Route$43._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { statusForStage as A, daysUntil as B, Tooltip as C, stageProgress as D, expectedCash as E, company as F, num as G, greeting as H, VAT_RATE as I, relative as K, cn as L, computeTotals as M, useSimulatedLoad as N, useOps as O, useStore as P, dateShort as R, Route$34 as S, TooltipTrigger as T, money as U, demoUsers as V, moneyExact as W, Route$25 as _, Route$5 as a, Route$28 as b, Route$9 as c, Route$15 as d, Route$17 as f, Route$23 as g, Route$21 as h, Route$3 as i, ASSEMBLY_STAGES as j, stageForStatus as k, Route$11 as l, Route$20 as m, Route as n, Route$7 as o, Route$19 as p, titleCase as q, Route$1 as r, Route$8 as s, router_exports as t, Route$13 as u, Route$26 as v, TooltipContent as w, Route$29 as x, Route$27 as y, dateTime as z };
