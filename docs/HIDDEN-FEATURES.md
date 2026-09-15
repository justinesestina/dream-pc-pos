# DPC NEXUS — Hidden Features (Record of Nakatagong Modules)

> **Ano ang file na ito?**
> Nung pinaliit namin ang app para sa **WooCommerce online-shop management**, 14 na modules ang
> **itinago** sa UI (sidebar, command palette, dashboard) — pero **hindi binura**. Nandito pa rin
> lahat ng routes at code, accessible pa rin via direct URL. Itong doc ang talaan ng kung anu-ano
> sila, para saan, at paano ibabalik kung kailanganin sa hinaharap.

---

## Quick Overview

| # | Module | Route | Relation sa WooCommerce setup |
|---|--------|-------|-------------------------------|
| 1 | Point of Sale (POS) | `/pos` | Walk-in/in-store sales |
| 2 | Returns / RMA | `/returns` | Customer returns & exchanges |
| 3 | Cash Drawer & Shifts | `/shifts` | Per-cashier drawer, open/close ng pondo |
| 4 | Serial Numbers | `/serials` | Serialized unit tracking (PC parts) |
| 5 | Custom Builds | `/builds` | Custom PC build quoting & config |
| 6 | Assembly Kanban | `/assembly` | Workshop pipeline (assembly → QA) |
| 7 | Purchasing (PO) | `/purchasing` | Purchase orders sa suppliers |
| 8 | Suppliers | `/suppliers` | Supplier directory & POs |
| 9 | Receiving | `/receiving` | Goods receipts, serial registration |
| 10 | Services / Repair | `/services` | Service tickets (repair/diagnosis) |
| 11 | Warranty | `/warranty` | Warranty registry & claims |
| 12 | Releases | `/releases` | Pickup/delivery scheduling |
| 13 | Documents | `/documents` | Receipts, invoices, quotations, release docs |
| 14 | Audit Log | `/audit` | Actor-activity trail |
ghh
**Kept (visible):** Dashboard, Orders, Quotes, Customers, Products, Inventory, Reports, Settings.

---

## Bakit tinago?

Ginagamit na lang ang app para i-manage ang **WordPress WooCommerce online shop** — ang orders at
quote requests ang pumapasok dito. Hindi naman kailangan ng tindahan para sa walk-in / workshop
operasyon **sa ngayon**. Para hindi mawala ang trabaho, hindi binura kundi **itinago lang sa**
navigation. Orihinal ang lahat ng functionality.

---

## Paano pa rin ma-access (habang nakatago)

- **Direct URL:** buksan ang address, hal. `https://<app>/pos`, `.../assembly`, `.../serials`.
  Gumagana pa rin ang route — hidden lang sa menu.
- **Permissions:** may entry pa rin ang hidden modules sa `src/lib/permissions.ts`, kaya kung may
  role (Owner/Admin/Cashier/Inventory) ay nagagamit pa rin ang mga ito.
- **Pinagsasabihan nito ang data:** parehong Demo Store ang gamit — mag-uupdate pa rin ang
  inventory, orders, at serials kahit tinago ang UI.

---

## 1. Point of Sale (POS)

- **Route:** `/pos` · saved as `src/routes/_app.pos.tsx`

### Para saan
Walk-in / counter sales. Dalawang-panel na screen: kaliwa ang product browsing, kanan ang cart at
checkout. Kung dati nabubuksan sa **F1** (ngayon F1 → Orders na).

### Ano ang kaya nito
- Product search by **name, SKU, o serial**; filter sa category, may product images
- Cart management: quantity, remove, discounts
- Payment methods: **Cash, GCash, Bank, Card** — may tendered/change para sa cash
- Serial selection para sa serialized items
- Customer selection (guest o registered)
- Auto-deduct ng stock kapag nakabayad (nagse-sign ng serials bilang `sold`)
- Makikita sa Orders page kapag natapos ang sale

---

## 2. Returns / RMA

- **Routes:** `/returns` · `/returns/$returnId`

### Para saan
Return/exchange request mula sa customer — para sa may sira, wrong item, o hindi nagustuhan.

### Status lifecycle
`requested → inspection → approved / rejected → refunded / replaced`

### Data na kinukuha
- Nakakabit sa **order, customer, at product**
- **condition:** `sealed` (hindi nabuksan), `used_good`, `used_damaged`, `defective`
- **resolution:** `refund`, `replacement`, `repair`, o wala
- **refund method** (cash/GCash/bank/card) at refund amount
- **restock** toggle — kung naka-on, babalik ang stock sa inventory (protected laban sa
  double-restock, may `restockedAt` marker)

---

## 3. Cash Drawer & Shifts

- **Routes:** `/shifts` · `/shifts/$shiftId`

### Para saan
Per-cashier na drawer tracking — sino bukas, magkano opening cash, at ano nangyari habang bukas.

### Ano ang kaya nito
- Open shift: `status: open | closed` kasama ang **opening cash**
- **Cash Adjustments:** cash-in / cash-out (may dahilan at actor)
- Close shift: manual counted cash (`countedCash`), **payment-method breakdown** (`tenders`:
  cash/gcash/bank/card), at refunds total
- History ng bawat shift sa list view

---

## 4. Serial Numbers

- **Route:** `/serials`

### Para saan
Ang serialized-unit tracking ng PC parts — CPU, GPU, RAM, motherboard, atbp. Bawat pisikal na unit
may kanya-kanyang serial para masubaybayan ang resale, warranty, at build.

### Serial statuses
`in_stock → reserved → installed → sold → rma` (bumalik/under-RMA)

### Ano ang kaya nito
- Search by serial, product, customer, o order
- Registry view ng lahat ng serialed items
- Link sa **build** (`buildId`), **order** (`orderId`), **customer** (`customerId`), at
  **warranty until** date
- Nagbabago ang status automatic: reservation sa quote approval, `sold` sa order payment,
  `installed` sa build assembly

---

## 5. Custom Builds

- **Routes:** `/builds` · `/builds/$buildId`

### Para saan
Para sa customer na gustong magpa-assemble ng custom PC — makapag-configure, makita ang
compatibility, at mabigyan ng quotation.

### Build statuses
`draft → quoted → approved → parts_reserved → assembly → testing → ready → released` (o `cancelled`)

### Ano ang kaya nito
- **Slots ng component:** CPU, Motherboard, RAM, GPU, Storage, PSU, Case, Cooling, Fans, Software,
  Accessories
- **Compatibility engine** (`src/lib/compatibility.ts`) — may error/warning/info issues batay sa
  category ng product
- Additional **services** (assembly, cable management, OS install, etc.) na may amount
- **QA checklist** (`src/lib/types.ts` → `QaCheck`) na naka-group sa hardware/testing, may
  `qaResult: pass | fail | null`
- Pagka-approve ng quote → mabubuo ang **order** (auto `parts_reserved` sa build, at nirereserve ang
  serials)
- `quoteFromBuild` — gawing quotation ang build at i-send sa customer

---

## 6. Assembly Kanban

- **Route:** `/assembly`

### Para saan
Workshop pipeline na pinagmamapa kung saang stage nakaabot ang mga build.

### Power dimension (kanban columns)
`Quote → Approved → Parts reserved → Assembly → Cable management → BIOS/firmware → OS installation → Driver installation → Testing → QA → Ready → Pickup/Delivery → Released`

Naka-group sa:
- **sales:** Quote, Approved, Parts reserved
- **assembly:** Assembly, Cable management, BIOS, OS, Drivers
- **validation:** Testing, QA
- **handover:** Ready, Pickup/Delivery, Released

### Ano ang kaya nito
- Drag-and-drop ang build mula sa isang stage papunta sa susunod
- **Technician** assignment
- Mula assembly pataas ay may **assembly steps checklist** at **test results** (pass/fail) sa
  workspace ng bawat build

---

## 7. Purchasing (Purchase Orders)

- **Routes:** `/purchasing` · `/purchasing/$poId`

### Para saan
Order ng stock mula sa suppliers — para hindi maubos ang pambenta.

### PO statuses
`draft → submitted → confirmed → partial → received` (o `cancelled`)

### Ano ang kaya nito
- Bawat PO may **supplier**, **expected date**, at **createdBy**
- Line items: product, SKU, qty, **received count**, **unit cost**
- Pagdating ng goods, sinasagot nito ang **receiving flow** at itina-tag bilang `partial` o
  `received` batay sa completion

---

## 8. Suppliers

- **Route:** `/suppliers` · `/suppliers/$supplierId`

### Para saan
Directory ng mga suppliers — contact details, terms, at history ng POs.

### Data na kinukuha
- Contact info (email/phone/address), payment **terms**, default **lead time**
- **categories** ng stocks na tinda nila, **rating**, `active/inactive` status
- Listahan ng mga nagawang **Purchase Orders** ng bawat supplier

---

## 9. Receiving

- **Routes:** `/receiving` · `/receiving/$receiptId`

### Para saan
Pag-tanggap at pag-verify ng goods kapag dumating na ang shipped order mula sa supplier.

### Receipt statuses
`in_progress → completed` (o `discrepancy` kung may kulang/sira)

### Ano ang kaya nito
- Mag-register ng **Goods Receipt** laban sa isang **Purchase Order + Supplier**
- Per line: **expected vs received vs damaged** counts
- **Register serials** sa arrival para sa serialized items
- Pagka-complete → ini-update ang PO status at tumataas ang inventory stock
- Naka-log ang **receivedBy** at timestamp

---

## 10. Services / Repair

- **Routes:** `/services` · `/services/$ticketId`

### Para saan
Service/repair tickets — diagnostic, pag-aayos, at release ng device ng customer.

### Service statuses
`received → diagnosing → waiting_customer → waiting_parts → in_repair → ready → released` (o `cancelled`)

### Ano ang kaya nito
- Ticket na may **device**, **issue**, at **diagnosis** notes
- **parts** (product + qty + price) at **labor** — may estimated at actual cost
- Timeline ng bawat update
- Kapag `ready` pwedeng i-schedule ng **Release** (pickup/delivery)
- Pwedeng gawing **service order** kapag may bayad

---

## 11. Warranty

- **Routes:** `/warranty` · `/warranty/$warrantyId` · `/warranty/claims/$claimId`

### Para saan
Registry ng warranty coverage ng lahat ng nabentang serialed units at claims kung may sira.

### Warranty statuses
`active → expiring → expired` (o `void`)

### Claim statuses (WarrantyClaim)
`open → in_review → approved / rejected → closed` — may **resolution** at **resolutionNote**, at
full timeline ng claim

### Ano ang kaya nito
- Bawat warranty naka-link sa **customer, product, serial, at order**
- May **purchasedAt** at **expiresAt**; `expiring` kung malapit na ma-expire
- Magbukas ng **claim** sa warranty at i-track ito hanggang sa sodasyon

---

## 12. Releases

- **Routes:** `/releases` · `/releases/$releaseId`

### Para saan
Scheduled pickup / delivery ng mga natapos na items — build, service, o order.

### Release record
- **kind:** `build | service | order` na may ref to the base document
- **method:** `pickup | delivery`, may `scheduledAt`
- **status:** `scheduled → released → completed`
- Sa release: may **releasedBy**; kapag natanggap: **receivedBy** + timestamp
- Pagka-complete, auto-update ng base record status (hal. build/service order → `released`)

---

## 13. Documents

- **Route:** `/documents`

### Para saan
Hindi pang-benta na repository ng mga pwedeng i-print na dokumento — may preview at print support.

### Ano ang meron dito
- **Receipts** (mula sa Orders)
- **Invoices** (mula sa Orders)
- **Quotations** (mula sa Quotes)
- **Release documents** (mula sa Releases — build/service/order)

Nabuo gamit ang print layout (jsPDF/html2canvas/canvg ang mga bundled na libs) para ma-download o
ma-print.

---

## 14. Audit Log

- **Route:** `/audit`

### Para saan
Activity trail ng app — sino gumawa ng ano, kailan, at saang entity.

### Data na kinukuha
- **actor** (user) at **role**, **action**, **entity** (hal. order, product, shift, PO), timestamp
- Nagrerecord ng pagbabago sa orders, inventory, shifts, purchasing, at iba pa
- Para sa compliance at troubleshooting

---

## Paano ibalik ang isang hidden module

Hindi naman kinakailangan, pero kung gusto mong i-restore sa menu:

1. **`src/components/app/nav-config.tsx`** — ibalik ang item/grupo sa navigation. May template pa
   rito mula sa old config (POS, Purchasing, Services, atbp.).
2. **`src/components/app/command-palette.tsx`** — ibalik ang entry sa search/commands kung gusto.
3. **`src/components/app/app-topbar.tsx`** — kung may search hint na babaguhin uli.
4. **`src/routes/_app.tsx`** — kung gusto mong ibalik ang **F1 → /pos** shortcut.
5. **`src/routes/_app.dashboard.tsx`** — kung gusto mo uling lumitaw ang quick action/panel sa
   dashboard.
6. I-verify: `npx tsc --noEmit` · `npx eslint <file>` · `npm run build`.

> Lahat ng routes at code nasa repo pa rin — walang tinanggal sa phase na ito. Kung may balak ka
> na mag-open ulit ng walk-in/POS o workshop operations, alisin lang ang nakatagong entry sa
> nav-config at buhay na uli ang modules.