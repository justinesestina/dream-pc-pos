import { chromium } from "playwright-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8081";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} | ${name}${detail ? ` | ${detail}` : ""}`);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

const bodyText = () => page.locator("body").innerText();
const waitForText = (needle, timeout = 20000) =>
  page.waitForFunction((t) => document.body.innerText.includes(t), needle, { timeout });

async function login(roleLabel, password) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.locator("button", { hasText: roleLabel }).first().click();
  await page.locator("#login-password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await waitForText("Dashboard", 15000);
}

async function addProduct(name, times = 1) {
  await page.goto(BASE + "/pos", { waitUntil: "networkidle" });
  await page.locator("[data-pos-search]").fill(name);
  const card = page.locator("button", { hasText: name }).first();
  await card.waitFor({ state: "visible", timeout: 15000 });
  for (let i = 0; i < times; i++) await card.click();
  await page.waitForTimeout(400);
}

async function checkoutCash(tendered = null) {
  await page.locator("button", { hasText: "Checkout" }).click();
  if (tendered === "exact") {
    await page.locator('[role="dialog"] button', { hasText: "Exact" }).click();
  } else if (tendered !== null) {
    await page.locator("#pos-tendered").fill(String(tendered));
  }
  await page.locator('[role="dialog"] button', { hasText: "Charge" }).click();
  await page.waitForURL("**/orders/**", { timeout: 15000 });
  await waitForText("PAID AT", 15000);
}

async function checkoutNonCash(method, reference) {
  await page.locator("button", { hasText: "Checkout" }).click();
  await page.locator('[role="dialog"] button', { hasText: method }).click();
  await page.locator("#pos-reference").fill(reference);
  await page.locator('[role="dialog"] button', { hasText: "Charge" }).click();
  await page.waitForURL("**/orders/**", { timeout: 15000 });
  await waitForText("PAID AT", 15000);
}

/* ------------------------------------------------------------------ login */
try {
  await login("Owner", "demo1234");
  check("A0 login as Owner", page.url().includes("/dashboard"), page.url());
} catch (e) {
  check("A0 login as Owner", false, String(e).slice(0, 200));
}

/* ------------------------------------------- FLOW A: cash retail w/ change */
try {
  await addProduct("Windows 11 Pro OEM License");
  await checkoutCash(10000);
  const b = (await bodyText()).toUpperCase();
  check("A1 cash order created", /DPC-\d{5}/.test(page.url()), page.url());
  check("A2 method Cash", b.includes("CASH"));
  check("A3 tendered shown", b.includes("10,000.00"), "expect ₱10,000.00 tendered");
  check("A4 change shown", b.includes("1,100.00"), "expect ₱1,100.00 change (10,000 - 8,900)");
  check("A5 total correct", b.includes("8,900"), "expect total ₱8,900");
} catch (e) {
  check("FLOW A cash sale", false, String(e).slice(0, 200));
}

/* ---------------------------------- FLOW B: non-cash retail w/ reference */
try {
  await addProduct("Windows 11 Pro OEM License");
  await checkoutNonCash("GCash", "GCASH-E2E-001");
  const b = (await bodyText()).toUpperCase();
  check("B1 gcash order created", /DPC-\d{5}/.test(page.url()), page.url());
  check("B2 method GCash", b.includes("GCASH"), "titleCase renders 'Gcash' → GCASH");
  check("B3 reference persisted", b.includes("GCASH-E2E-001"));
  check("B4 tendered = amount", b.includes("8,900.00"));
} catch (e) {
  check("FLOW B non-cash sale", false, String(e).slice(0, 200));
}

/* --------------------- FLOW C: multi-serial → one warranty per serial */
try {
  await addProduct("AMD Ryzen 5 7600", 2);
  await page.locator("button", { hasText: "S/N 0/2" }).click();
  const boxes = page.locator('[role="dialog"] button[data-state="unchecked"]');
  const n = await boxes.count();
  check("C1 serials listed", n >= 2, `${n} serials in register`);
  await boxes.nth(0).click();
  await boxes.nth(1).click();
  await page.locator('[role="dialog"] button', { hasText: "Assign serials" }).click();
  await page.waitForTimeout(300);
  await checkoutCash("exact");
  const b = (await bodyText()).toUpperCase();
  const c = await page.locator("button", { hasText: "File claim" }).count();
  check("C2 order created", /DPC-\d{5}/.test(page.url()));
  check("C3 one warranty per serial (2)", c === 2, `${c} File-claim buttons`);
  check("C4 serial links shown", b.includes("7600") && b.includes("S/N:"), "serials on order");
} catch (e) {
  check("FLOW C multi-serial warranties", false, String(e).slice(0, 200));
}

/* --------------------------------- FLOW G: warranty claim from order */
try {
  const claimBtn = page.locator("button", { hasText: "File claim" }).first();
  await claimBtn.waitFor({ state: "visible", timeout: 10000 });
  const orderUrl = page.url();
  await claimBtn.click();
  await page.locator("#claim-reason").fill("E2E fault test");
  await page.locator('[role="dialog"] button', { hasText: "File claim" }).last().click();
  await waitForText("filed for serial", 10000);
  const b = (await bodyText()).toUpperCase();
  check("G1 claim filed toast", b.includes("FILED FOR SERIAL"), "toast about filed claim");
  check("G2 stayed on order", page.url() === orderUrl);
} catch (e) {
  check("FLOW G warranty claim", false, String(e).slice(0, 200));
}

/* ---------------------------- FLOW D: service sale service total correct */
try {
  await addProduct("Custom Build Assembly");
  await checkoutCash(5000);
  const b = (await bodyText()).toUpperCase();
  check("D1 service order created", /DPC-\d{5}/.test(page.url()));
  check("D2 service total shown", b.includes("2,500.00"), "expect service total ₱2,500.00");
  check("D3 total correct", b.includes("2,500"), "expect total ₱2,500");
} catch (e) {
  check("FLOW D service total", false, String(e).slice(0, 200));
}

/* ------------------------- FLOW E: consultation → build reverse link */
try {
  await page.goto(BASE + "/consultations/CONS-10486", { waitUntil: "networkidle" });
  const convertBtn = page.locator("button", { hasText: "Convert to build + quote" });
  await convertBtn.waitFor({ state: "visible", timeout: 15000 });
  await convertBtn.click();
  await waitForText("Converted CONS-10486", 10000);
  const buildLink = page.locator("a", { hasText: "BUILD-" }).first();
  check("E1 conversion toast", true, "Converted CONS-10486 to BUILD-…");
  check("E2 recommended build link", (await buildLink.count()) > 0);
  await buildLink.click();
  await page.waitForURL("**/builds/**", { timeout: 15000 });
  await waitForText("CONS-10486", 15000);
  check("E3 build page consultation link", true, "Links section shows CONS-10486");
} catch (e) {
  check("FLOW E consultation convert", false, String(e).slice(0, 200));
}

/* ------------- FLOW F: release scheduled → released → completed + sync */
try {
  await page.goto(BASE + "/releases", { waitUntil: "networkidle" });
  const markBtn = page.locator("button", { hasText: "Mark released" }).first();
  await markBtn.waitFor({ state: "visible", timeout: 15000 });
  await markBtn.click();
  await waitForText("marked released", 10000);
  const b = (await bodyText()).toUpperCase();
  check("F1 marked released toast", b.includes("MARKED RELEASED"));
  check("F2 row shows Released badge", b.includes("RELEASED"), "uppercase via CSS");

  const row = page.locator("tr", { hasText: "BUILD-10477" }).first();
  await row.click();
  await page.waitForURL("**/releases/REL-00311", { timeout: 15000 });
  const handoverBtn = page.locator("button", { hasText: "Complete handover" });
  await handoverBtn.waitFor({ state: "visible", timeout: 15000 });
  check("F3 detail shows released state", true, "received-by + complete button");
  await page.locator("#received-by").fill("E2E Receiver");
  await handoverBtn.click();
  await waitForText("handover completed", 10000);
  const d = (await bodyText()).toUpperCase();
  check("F4 handover completed toast", d.includes("HANDOVER COMPLETED"));
  check("F5 completedAt shown", d.includes("COMPLETED AT") && d.includes("2026"));
  check("F6 completed badge", d.includes("COMPLETED"));

  await page.goto(BASE + "/builds/BUILD-10477", { waitUntil: "networkidle" });
  await waitForText("BUILD-10477", 15000);
  const bb = (await bodyText()).toUpperCase();
  check("F7 store build status synced (released)", bb.includes("RELEASED"));
} catch (e) {
  check("FLOW F release two-step", false, String(e).slice(0, 200));
}

/* ------------------------------------------------------------------ done */
const passed = results.filter((r) => r.ok).length;
console.log("\n==============================================");
console.log(`RESULT ${passed}/${results.length} passed`);
for (const r of results.filter((x) => !x.ok)) console.log(`  MISSING: ${r.name}`);
if (pageErrors.length) {
  console.log("PAGE ERRORS:");
  for (const e of pageErrors.slice(0, 8)) console.log("  -", e.slice(0, 300));
}
await browser.close();
