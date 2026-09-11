# DPC NEXUS — Features Explained

> Anong meron sa POS na 'to, para saan ang bawat isa, at paano gamitin.
> Para sa kahit sino — owner, cashier, technician, o inventory staff.

---

## How to Read This Guide

Maikli at direct lang — bawat feature may:

- **Para saan?** — bakit naka-built ito (anu-ano nilo-solve nito sa negosyo)
- **Paano gamitin?** — step-by-step
- **Saan makikita?** — anong menu/route

---

## Table of Contents

1. [Login & Roles](#1-login--roles)
2. [Dashboard / Home](#2-dashboard--home)
3. [Point of Sale (POS)](#3-point-of-sale-pos)
4. [Orders](#4-orders)
5. [Quotes](#5-quotes)
6. [Returns / RMA](#6-returns--rma)
7. [Cash Drawer & Shifts](#7-cash-drawer--shifts)
8. [Products](#8-products)
9. [Inventory](#9-inventory)
10. [Serial Numbers](#10-serial-numbers)
11. [Custom Builds](#11-custom-builds)
12. [Assembly Kanban](#12-assembly-kanban)
13. [Purchasing (Purchase Orders)](#13-purchasing-purchase-orders)
14. [Suppliers](#14-suppliers)
15. [Receiving](#15-receiving)
16. [Customers](#16-customers)
17. [Services / Repair](#17-services--repair)
18. [Warranty](#18-warranty)
19. [Releases](#19-releases)
20. [Documents](#20-documents)
21. [Reports](#21-reports)
22. [Settings](#22-settings)
23. [Audit Log](#23-audit-log)
24. [Notifications](#24-notifications)
25. [Command Palette & Shortcuts](#25-command-palette--shortcuts)

---

## 1. Login & Roles

**Menu:** Sign in page (unang page ng app)

### Para saan?

Para ma-secure ang app per posisyon sa tindahan. May **4 na role**, bawat isa may kanya-kanyang access. Demo lang ito — walang tunay na server auth.

### Paano gamitin

1. Buksan ang app — makikita mo agad ang login page
2. Pumili ng role (may 4 na profile card: Owner, Admin, Cashier, Inventory Staff)
3. I-type ang password, o i-click ang button para mag-fill ng demo account
4. Magla-login ka papunta sa tamang home page para sa role mo

### Ang 4 na roles

| Role | Ano ang makikita | Home page |
|---|---|---|
| **Owner** | Lahat — kasama ang Audit Log (tanging role na may access dito) | Dashboard |
| **Admin** | Lahat maliban sa Audit Log | Dashboard |
| **Cashier** | POS, Orders, Quotes, Customers, Products, Returns, Cash Drawer, Documents, Releases | POS |
| **Inventory Staff** | Products, Inventory, Orders, Purchasing, Receiving, Returns, Documents | Inventory |

**Importante:** Ang role restrictions ay UI-level lang (pagtatago ng menu). Hindi ito tunay na security — hindi pa naka-connect sa backend.

### Password

```
Owner:    demo1234
Admin:    admin1234
Cashier:  cashier1234
Inventory: stock1234
```

---

## 2. Dashboard / Home

**Menu:** Overview → Dashboard (o `/dashboard`)

### Para saan?

Isang tingin lang — **ano ang kalagayan ng negosyo ngayon**? Dito mo makikita kung may kailangan ng atensyon bago mo pa buksan ang ibang modules.

### Ano ang makikita

| Section | Ano ang pinapakita |
|---|---|
| **KPI Cards** | Today's Sales, Orders Today, Open Service Tickets, Builds in Progress, Pending Returns, Low Stock count |
| **Sales Chart** | Kita at bilang ng orders — pwede i-switch: Today (per oras), 7 Days, 30 Days |
| **Quick Actions** | Shortcuts: New Sale, New Build, View Inventory, at iba pa |
| **Build Pipeline** | Aktibong custom builds — saang yugto na sila (assembly, testing, etc.) |
| **Recent Transactions** | Pinakabagong orders na may halaga |
| **Notifications** | Mga kamakailang alerts |
| **Activity Log** | Trail ng mga ginawa sa system |

### Paano gamitin

- Buksan ang app → agad mapupunta ka dito (kung owner/admin ka)
- I-click ang **+ New Sale** para dumiretso sa POS
- I-click ang mga KPI card para lumingon sa specifics

---

## 3. Point of Sale (POS)

**Menu:** Sales → Point of Sale (o `/pos`)
**Shortcut:** `F1`

### Para saan?

Ito ang **pinaka-core ng system** — dito nagbebenta ka ng PC parts sa harap ng customer. Dalawang panel: kaliwa ang product browser, kanan ang cart. Designed para mabilis ang pag-checkout.

### Paano gamitin — step by step

**1. Hanapin ang produkto**
- Gumamit ng search bar (pangalan, SKU, o brand)
- O i-filter sa pamamagitan ng category chips (CPU, GPU, RAM, atbp.)
- May grid/list toggle para sa paningin ng products

**2. Idagdag sa cart**
- I-click ang produkto → lalabas sa cart
- Bawat produkto may badge: `n IN STOCK` (berde), `OUT OF STOCK` (pula), o `SERVICE` (cyan)

**3. Ayusin ang quantity**
- I-plus/i-minus sa cart panel
- **Hindi mo malalagpasan ang available stock** — protektado ang system

**4. Serial numbers (kung kinakailangan)**
- Para sa high-value items (GPU, CPU), pwedeng pumili ng exact serial na ibebenta
- Makikita mo kung aling serial ang available

**5. Customer**
- Default: "Walk-in Customer"
- Pwede mag-search ng existing customer, o gumawa ng bago

**6. Discount**
- Pwede maglagay ng discount bago mag-checkout

**7. Checkout → Payment**
- Piliin: **Cash** (may quick-tender chips na nag-round up ng total — hal. ₱500, ₱1,000, ₱5,000 — automatic ang change), **GCash**, **Bank Transfer**, o **Card** (nangangailangan ng reference number)

**8. Complete sale**
- Mag-appear ang success screen: order #, total, at mga button (View Order, Print Receipt, New Sale)

### Iba pang POS features

| Feature | Paano |
|---|---|
| **Hold Sale** | I-save ang current cart para sa ibang customer — merong listahan ng held carts para i-resume |
| **Sale Notes** | Maglagay ng notes sa isang transaction (hal. "gift wrap") |
| **Cart customer** | Pwede magpalit ng customer kahit na nasa gitna ka na |

### Ano ang nangyayari pagkatapos mag-checkout (automatic)

- Gumagawa ng **Order** (DPC-xxxxx)
- Nabawasan ang **inventory** (onHand)
- Nasa-mark ang **serials** as sold
- Nag-create ng **Warranty** para sa serial-tracked items
- May **notification** at **audit log**

---

## 4. Orders

**Menu:** Sales → Orders (o `/orders`)
**Detail page:** i-click ang order number

### Para saan?

Record ng lahat ng benta. Basahin at sundan ang status ng bawat order — mula pending hanggang completed o refunded.

### Order Statuses

| Status | Ibig sabihin |
|---|---|
| Pending | Nagawa na pero hindi pa bayad |
| Paid | Bayad na (default kapag may POS sale) |
| Processing | Inihahanda na |
| Assembly | Isang custom build ang ina-assemble |
| Testing | Nasa QA testing |
| Ready | Handa nang kunin |
| Completed | Ganap na tapos |
| Cancelled | Kinansela |
| Refunded | Binalik ang bayad |

### Paano gamitin

**List page:**
- Mag-search (order #, customer, cashier)
- I-filter sa pamamagitan ng status o date range

**Detail page:**
- Tingnan ang **items** at **payment summary** (subtotal, discount, VAT, total)
- Palitan ang **status** (paglipat ng status = may timeline record din)
- Tingnan ang **timeline** — sunod-sunod na history ng order
- Tingnan ang **notes**, **serial numbers**, at **warranty** info
- Mula dito, pwede kang mag-link papunta sa customer, build, o return

---

## 5. Quotes

**Menu:** Sales → Quotes (o `/quotes`)

### Para saan?

Dito ka gumagawa ng **presyuhan/quotation** para sa customer bago pa siya bumili. Lalo na importante sa PC builds at malalaking orders — pareho ninyo kailangan magkasundo sa presyo bago mag-sale.

### Quote Statuses

```
Draft → Sent → Pending → Approved → Converted to Order
                          ↓
                      Rejected / Expired
```

### Paano gamitin

**Gumawa ng quote:**
1. I-click ang **New Quote**
2. Pumili ng customer
3. Magdagdag ng items (products + quantity)
4. Pumili ng discount kung mayroon
5. Ilagay ang service/labor total kung mayroon
6. Itakda kung ilang araw valid ang quote (default 14)
7. I-save

**Palitan ang status:**
- Draft → Sent (ipinadala sa customer — may custom na cover message)
- Pending → Approved (pumayag ang customer)
- Approved → **Convert to Order** ← ito ang pinakaimportante

**I-edit at i-send ang quote (Editor):**
1. Sa **Quotes dashboard**, tingnan ang customer column — bawat quote ay may **Editor** button (may pencil icon)
2. I-click ang **Editor** → pipili ng customer (naka-set na, pwedeng palitan)
3. Makikita mo ang buong quotation at **maaaring i-edit lahat**:
   - **Items** — magdagdag/alisin, palitan ang product, quantity, at **presyo kada item**
   - **Discount** — ilagay kung may bawas sa presyo
   - **Service / labor** — halaga ng assembly/installation
   - **Notes** — tala na nakalagay sa quotation
   - **Valid for (days)** — hanggang kailan valid
   - Kita agad ang **totals** (subtotal, discount, services, VAT, total)
4. I-click **Continue to message** → isulat ang subject at cover message (pre-filled template)
5. I-click **Preview PDF** → makikita mo ang **actual na PDF file (A4)** kasama ang **logo** ng kumpanya — i-check mo ang layout at kung nababasa lahat bago i-send
6. I-click **Send to customer** → **i-e-mail ang quotation** (simulated) at magiging `sent` ang status

Ang parehong editor ay available din sa **Quote Detail** page sa pamamagitan ng **"Send to customer"** o **"Resend / edit message"** button.

**I-view / i-download ang PDF ng buong quotation:**
1. Sa **Quote Detail** page, i-click ang **View PDF** button (nasa tabi ng "Print quotation")
2. Bubuksan ang **PDF preview** — eksaktong A4 na layout ng buong quotation (company header, customer block, items table, totals, notes)
3. Pwede mong **Download PDF** (ma-save ang `.pdf` file) o **Open in browser** (may sariling print button ang PDF viewer)

**Ano ang laman ng customer message:**
- Custom cover message mo (ang sinusulat mo sa compose dialog)
- Auto-generated **items table** (item name, quantity, unit price, amount)
- **Totals** (subtotal, discount, services, VAT, total)
- **Validity date** ng quote
- **Signature block** — prepared by + Dream PC Build & IT Solutions

### Ano ang "Convert to Sale"?

Ang pinakamahalagang workflow sa Quotes:
1. I-click ang **Convert to Order** sa an approved quote
2. Gumagawa ang system ng **pending order**
3. **Nirereserve** ang inventory (kaya hindi maibebenta sa iba)
4. Ang serial-tracked items ay na-reserve din
5. Kung galing sa build ang quote, ang build ay nagiging `parts_reserved`

**Quote mula sa Build:** May feature na gumagawa ng quote AUTOMATIKO mula sa components ng custom build (kasama ang assembly services).

---

## 6. Returns / RMA

**Menu:** Sales → Returns (o `/returns`)

### Para saan?

Kapag nagbalik ang customer ng binili — defective, mali, o hindi nagustuhan. Ini-track kung anong nabalik, bakit, at ano ang nangyari (refund o replace).

### Return Statuses

```
Requested → Inspection → Approved → Refunded / Replaced
                     ↓
                  Rejected
```

### Paano gamitin

**Gumawa ng return:**
1. I-click ang **New Return**
2. Piliin ang pinagmulan: order, product, serial (kung mayroon)
3. Ilagay ang quantity, reason, at condition (item's condition upon return)
4. Piliin ang refund method
5. I-save

**Process ang return:**
- I-click ang status para ilipat sa Inspection
- Approve o Reject
- Kung approve → Refunded o Replaced → **ibaba-balik ang stock sa inventory** (automatic)

### Importante: One-time restock guard

Ang stock ay **isang beses lang** ibabalik sa inventory. Hindi pwedeng i-double ang pagbabalik — protektado ito ng system kaya walang duplicate stock.

---

## 7. Cash Drawer & Shifts

**Menu:** Sales → Cash Drawer (o `/shifts`)

### Para saan?

Para sa tamang accounting ng **laman ng cash drawer** bawat araw/shift. Iniiwasan nito ang confusion: magkano ba dapat nasa drawer vs magkano ang nasa drawer talaga.

### Paano gamitin

**Magbukas ng shift:**
1. I-click ang **Open Shift** (o magsimula ng bago)
2. Ilagay ang **opening cash** (float/panimulang pera)
3. Itala ang cashier name
4. I-save → bukas na ang draw

> Kung may existing na open shift, **awtomatikong isasara** ito kapag nagbukas ka ng bago.

**Sa gitna ng shift:**
- Pwedeng mag-add ng **cash adjustment**:
  - `Cash In` — idinagdag na pera (hal. humingi ng extra na panukli)
  - `Cash Out` — inalis na pera (hal. na-deposit sa bangko)

**Isara ang shift:**
1. Bilangin ang cash sa drawer
2. I-type ang **counted cash**
3. Ilagay ang breakdown per payment method (Cash, GCash, Bank, Card)
4. Ilagay ang total refunds
5. I-save

### Awtomatikong kalkulado

```
Expected Cash = Opening + Cash Sales + Adjustments − Refunds
Variance      = Counted Cash − Expected Cash
```

- **Positive variance** = may sobra (overage)
- **Negative variance** = may kulang (shortage)
- Ito ang basis kung ilan ang dapat nasa drawer at kung match ba sa bilang

---

## 8. Products

**Menu:** Inventory → Products (o `/products`)

### Para saan?

**Catalog ng lahat ng ibinebenta** — PC parts at services. Dito tinatago ang presyo, cost, specs, at warranty period ng bawat item.

### Paano gamitin

**Gumawa ng product:**
1. I-click ang **+ Add Product**
2. Ilagay ang:
   - Pangalan, SKU (unique — hindi pwedeng maulit), brand
   - Category (CPU, GPU, RAM, atbp.)
   - Type: **Product** (may stock) / **Service** (unlimited) / **Bundle**
   - Price (selling) at cost (hindi nakikita ng cashier)
   - Serial tracking switch (kung high-value item na need ng per-unit tracking)
   - Warranty months
   - Location at supplier
   - Specs (varies per category — hal. socket para sa CPU, wattage para sa PSU)
3. I-save → gumagawa rin ito ng inventory record para sa stock level

**I-edit/archive:**
- I-click ang product → detail page → edit
- **Archive** = soft delete (hindi na ibinebenta pero nasa record pa rin)
- May tab para makita ang archived products at ma-restore

**Categories:**
- May 17 categories built-in (CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooling, Fans, Monitor, Keyboard, Mouse, Headset, Networking, Accessories, Software, Services)
- Pwede mag-add/rename/archive ng categories

### Product Types vs Services

| Type | Stock? | Halimbawa |
|---|---|---|
| **Product** | May stock (nagbabawas ang benta) | RTX 5070, Ryzen 7 7800X3D |
| **Service** | Unlimited (walang stock) | Custom Build Assembly, PC Maintenance |
| **Bundle** | Maaaring may stock | Pre-built combos |

---

## 9. Inventory

**Menu:** Inventory → Inventory (o `/inventory`)

### Para saan?

**Stock management.** Hindi ito basta "quantity" — may kita kang on hand, reserved, available, damaged. Kaya alam mo kung ano talaga ang pwedeng ibenta.

### Ang stock model

```
On Hand      = kabuuang pisikal na stock
Reserved     = naka-reserve para sa orders/quotes/builds
Available    = On Hand − Reserved  ← ito ang pwedeng ibenta
Damaged      = sirang units
Sold         = kabuuang naibenta (history)
```

**Formula:** `Available = max(0, On Hand − Reserved)`

### Status detection

| Status | Kailan |
|---|---|
| **IN STOCK** | Maayos ang stock level (mahigit sa reorder point) |
| **LOW STOCK** | On hand ≤ reorder point (kailangan mag-order) |
| **OUT OF STOCK** | On hand = 0 |

### Paano gamitin

- Makita ang buong talahanayan ng stock: product, SKU, category, on hand, reserved, available, damaged, sold, status, price, location
- I-click ang product → **inventory detail page**:
  - Stock counters
  - **Adjust stock** — manual adjustment (+/-) na may reason (hal. "counted 2 extra units found")
  - **Serials** — ang mga serial ng produktong ito
  - **Movement history** — Stone ledger ng lahat ng stock changes (received, reserved, sold, adjusted, damaged, returned) na may date at actor

### Inventory Movements

| Movement | Kailan |
|---|---|
| Received | Nakatanggap ng stock (supplier/receiving o adjustment) |
| Reserved | Ni-reserve para sa order/quote |
| Sold | Naibenta via POS |
| Adjusted | Manual na adjustment |
| Damaged | Na-mark as sira |
| Returned | Binalik ng customer (RMA) |

---

## 10. Serial Numbers

**Menu:** Inventory → Serial Numbers (o `/serials`)

### Para saan?

Para sa **per-unit tracking ng high-value items.** Bilang PC store, importante na malaman mo kung saan ang exact unit — sino ang bumili, saang build naka-install, may warranty pa ba. Ito ang sekreto para marating ang: *"bakit may problema ang unit na 'to?"*

### Serial Statuses

| Status | Ibig sabihin |
|---|---|
| In Stock | Available sa inventory |
| Reserved | Naka-reserve para sa order/quote |
| Installed | Naka-install sa custom build |
| Sold | Naibenta sa customer |
| RMA | Nasa return/repair |

### Ang serial lifecycle

```
Registered (In Stock)
    ↓
Reserved (nag-sign up sa order)
    ↓
Installed sa build  OR  Sold via POS
    ↓
Warranty active
    ↓
pwede pang mag-RMA
```

### Paano gamitin

- **Register serials:** Bulk-irehistro ang mga bagong serial para sa isang product (deduplicated — hindi pwedeng maulit)
- **Search** at **filter** by status
- I-click ang isang serial para makita ang buong info: status, customer, order/build, warranty expiration

---

## 11. Custom Builds

**Menu:** Inventory → Custom Builds (o `/builds`)

### Para saan?

Ito ang **malakas na differentiating feature** ng Dream PC. Dito ka magpo-configure ng custom PC para sa customer — pipili ng parts, e-check ang compatibility, kalkulahin ang presyo, i-track hanggang pagbuo at pag-release.

### Build Statuses

```
Draft → Consultation → Quoted → Approved → Parts Reserved →
Assembly → Testing → Ready → Released
```

### Paano gamitin

**Gumawa ng build:**
1. I-click ang **+ New Build**
2. Ilagay ang customer, purpose (Gaming/Workstation/Office), budget, notes
3. Gumagawa agad ng default services: Assembly (₱2,500), Windows install (₱1,000), Cable management (₱500)

**Pumili ng components:**
1. Pumili ng slot (CPU, Motherboard, RAM, GPU, Storage, PSU, Case, Cooling, Fans, OS, Accessories)
2. Pumili ng product mula sa inventory
3. Awtomatiko ang qty (pwede i-adjust)

**Compatibility check (AWTOMATIKO):**
Tuwing may idadagdag kang part, may engine na nag-che-check ng:
- ✓ CPU socket vs motherboard socket
- ✓ RAM generation (DDR4/DDR5) vs motherboard
- ✓ PSU wattage vs CPU+GPU power requirement
- ✓ Case form factor vs motherboard size
- ⚠ "BIOS update might be needed" warnings
- ⚠ PSU headroom tight warnings
- ✕ Kapag hindi compatible — red alert agad

**Build summary:**
- Parts total + services = grand total (real-time kalkulado)

**I-generate ang quote mula sa build:**
- Isang click → gumagawa ng quote (14 days valid) kasama ang lahat ng parts at services

**I-handle sa pag-assemble:**
- I-approve ang build → convert to order → mapupunta sa Assembly kanban para sa assembly

### Build Detail Page Sections

- Components by slot
- Compatibility panel (may kulay per issue)
- Services (assembly, OS, etc.)
- QA checklist (mga test items)
- Totals
- Linked quote/order
- Technicians at QA staff

---

## 12. Assembly Kanban

**Menu:** Inventory → Assembly (o `/assembly`)

### Para saan?

Ang **visual board** para sa mga build na pisikal na ina-assemble sa workshop. Dito alam mo kung saang yugto ang bawat build at sino ang humahawak nito.

### Ang mga yugto (columns)

```
QUOTE → APPROVED → PARTS RESERVED → COMPONENT INSTALL →
BIOS/OS → STRESS TEST → QA REVIEW → READY
```

### Paano gamitin

- Tingnan ang lahat ng builds sa board, naka-group per stage
- **I-search** by build ID o customer
- **I-filter** by technician
- **I-assign** agad ang technician/QA sa card
- **I-move** ang build sa susunod na stage

### Assembly statuses

Sa isang build, mayroong:
- **Assembly checklist** (9 steps): motherboard prep, CPU install, RAM install, storage, GPU, PSU, cable management, BIOS, OS install
- **Stress tests** (5): CPU test, GPU test, memory test, thermal test, stability test — bawat isa may pass/fail at reading

### QA Sign-off

- Ito ang huling tsek — dapat lahat ng tests ay **PASS**
- Kung pumasa → awtomatikong uusad sa `Ready`
- Kung may failed test → critical notification, hindi pupwede sa ready

---

## 13. Purchasing (Purchase Orders)

**Menu:** Inventory → Purchasing (o `/purchasing`)

### Para saan?

**Pag-o-order ng stock sa mga supplier.** Ito ang tamang paraan para mag-restock — hindi diretso adjustment. Ini-track ang buong buhay ng order: gawa → ipadala → confirm → matanggap.

### PO Statuses

```
Draft → Submitted → Confirmed → Partial → Received
                          ↓
                      Cancelled
```

### Paano gamitin

1. I-click ang **+ New PO**
2. Pumili ng supplier
3. Magdagdag ng product lines (product, qty, unit cost — auto-computed ang line total)
4. Ilagay ang expected date at notes
5. I-save → Draft status

**Ilipat ang status:** Draft → Submitted → Confirmed
Pagdating ng goods → kapag in-receive mo na (tingnan ang Receiving section), **awtomatiko** ang PO status:
- Lahat na-receive → `Received`
- Bahagi lang → `Partial`

---

## 14. Suppliers

**Menu:** Inventory → Suppliers (o `/suppliers`)

### Para saan?

**Directory ng mga supplier/vendor** — para mabilis mong mahanap kung saan bibili at kanino ka utang sa mga parts.

### Supplier Fields

| Field | Ibig sabihin |
|---|---|
| Name | Pangalan ng kumpanya |
| Contact | Taong-contact sa supplier |
| Email / Phone | Contact details |
| Address | Pisikal na address |
| Terms | Payment terms (hal. "Net 30") |
| Lead Time | Gaano katagal dumating ang order |
| Categories | Anong klase ng products ang dinidiliver |
| Rating | 0-5 (pwedeng i-rate) |
| Status | Active / Inactive |

### Paano gamitin

- **+ Add Supplier** para magdagdag ng bago
- I-click ang supplier → makikita mo ang profile at ang kanilang mga purchase orders
- Maaaring i-edit ang lahat ng datos

---

## 15. Receiving

**Menu:** Inventory → Receiving (o `/receiving`)

### Para saan?

Ang **pag-receive ng paparating na stock** mula sa supplier. Inihahambing ang in-order mo vs ang tunay na dumating — kaya nakikita mo agad kung may kulang o sobra.

### Receipt Statuses

| Status | Ibig sabihin |
|---|---|
| In Progress | Kasalukuyang nirereceive |
| Completed | Lahat dumating at nai-record |
| Discrepancy | May kulang/maiiba sa in-order |

### Paano gamitin — step by step

1. Pumunta sa Purchasing → buksan ang PO → i-click ang **Receive**
2. Gumagawa ang system ng Goods Receipt (GR-xxxxx) mula sa PO
3. Para sa bawat line:
   - Ilagay ang **received** quantity
   - Ilagay ang **damaged** quantity (kung may nasirang dumating)
   - I-rehistro ang **serial numbers** (para sa serial-tracked items)
4. Magdagdag ng notes
5. I-click ang **Complete Receipt**

### Awtomatikong mangyayari kapag natapos

- **Dumagdag ang stock** sa inventory
- Na-rehistro ang **serials**
- Na-update ang **PO status** (partial o received)
- Ma-re-record ang movements at audit

---

## 16. Customers

**Menu:** Customers → Customers (o `/customers`)

### Para saan?

**Address book ng lahat ng customer** na may kumpletong history — bawat order, quote, build, service, warranty. Ito ang "360-degree view" ng relasyon mo sa customer.

### Paano gamitin

- **+ Add Customer** → name, email, phone, address, notes
- I-click ang customer → **profile page** na may:

```
JUAN DELA CRUZ
Total Spent: ₱182,450  |  Orders: 7  |  Builds: 2  |  Services: 3  |  Warranties: 5

[Orders] [Quotes] [Builds] [Services] [Warranties] [Timeline]
```

- Bawat tab may listahan ng related records — clickable, diretso sa detail

### Bakit importante

Hindi basta taga-record — nakikita mo kung **magkano na ang inispend** ng customer, anong build meron siya, at kung may active warranties. Ito ang ginagamit mo para sa follow-ups at customer service.

### Walk-in

Sa POS, kung walang napiling customer, "Walk-in Customer" ang tawag sa order.

---

## 17. Services / Repair

**Menu:** Customers → Services (o `/services`)

### Para saan?

Ang **repair/maintenance module** — hindi lang pagbebenta ng parts ang negosyo, kasama rin ang IT support. Dito ini-track ang mga device na dinadala ng customer para ayusin.

### Service Statuses

```
Received → Diagnosing → In Repair → Ready → Released
              ↓              ↓
      Waiting for Customer  Waiting for Parts
              ↓
          Cancelled
```

### Paano gamitin

**Gumawa ng service ticket:**
1. I-click ang **+ New Ticket**
2. Ilagay ang customer, **device** (hal. "Custom PC", "Laptop"), at **issue** (hal. "random shutdown")
3. Ilagay ang estimated cost at labor
4. I-save → status: Received

**Technician workflow:**
- **Diagnose** — ilagay ang diagnosis, ilipat sa In Repair
- **Add parts** — kumuha ng parts mula sa inventory (nababawasan ang stock, nililista sa ticket)
- **Remove parts** — kung hindi ginamit, ibabalik ang stock
- **Mark Ready** — kapag tapos na

### Service Ticket Detail

```
SERVICE #SRV-10482
Customer: Juan Dela Cruz      Device: Custom PC
Issue: Random shutdowns       Diagnosis: Failing PSU

Parts Used:
Corsair RM850e (PSU)        ₱6,500

Labor: ₱1,500                Estimated: ₱8,000  Actual: ₱8,000
```

### Timeline

Bawat status change may record — sino, kailan, anong ginawa.

---

## 18. Warranty

**Menu:** Customers → Warranty (o `/warranty`)

### Para saan?

**Sentral na lugar para sa lahat ng warranty** ng mga naibentang items. Awtomatiko itong gumagawa kapag may sale ng serial-tracked item — kaya wala kang may makakalimutang warranty.

### Paano gumagawa ang warranty (AUTOMATIC)

Kapag may naibenta kang serial-tracked item sa POS:
1. Nag-set ang serial ng `warrantyUntil` (purchase date + warranty months ng product)
2. Gumagawa ng **Warranty record** na naka-link sa: customer, product, serial, order

### Warranty Dashboard

| Count | Ibig sabihin |
|---|---|
| Active | Kasalukuyang valid |
| Expiring Soon | Ma-e-expire sa loob ng 30 araw |
| Expired | Tapos na ang warranty |
| Open Claims | May nakabinbing warranty claims |

### Warranty Detail

```
WARRANTY #WR-20452 | Status: Active
Customer: Juan Dela Cruz
Product: RTX 5070 Gaming OC
Serial: SN-5070-92831
Order: DPC-10482
Purchased: Sep 11, 2026 | Warranty until: Sep 11, 2027

[Service History] [Claims]
```

### Warranty Claims

**Gumawa ng claim** — pag ika'y a-return ang warranty:
1. Buksan ang warranty → **New Claim**
2. Ilagay ang reason
3. Status: Open

**Claim statuses:**

```
Open → In Review → Approved / Rejected → Closed
```

### Bakit importante

Sa PC business, additional service ang warranty — ito ang gustong makita ng customer. Kapag maayos ang pag-track ng warranty, mas professional ka sa mata nila.

---

## 19. Releases

**Menu:** Customers → Releases (o `/releases`)

### Para saan?

Ang **handover schedule** — pag ready na ang isang build, service, o order para kunin/deliver sa customer. Ini-track kung kailan nakaiskedyul at kung sino ang nag-release at nakatanggap.

### Release Statuses

```
Scheduled → Released → Completed
```

### Release Kinds

| Kind | Ano |
|---|---|
| Build | Custom PC build para i-release |
| Service | Natapos na repair |
| Order | Regular order |

### Paano gamitin

1. I-click ang **+ New Release**
2. Piliin ang kind (build/service/order) at kung anong record
3. Itakda ang schedule at kung pickup o delivery
4. I-save → Scheduled

**Kapag na-release sa customer:**
- `Released` → ilagay kung sino ang nag-release

**Kapag nada-deliver/nakuha na:**
- `Completed` → ilagay ang nakatanggap

### Awtomatikong mangyayari

Kapag `Completed` ang isang release, nag-a-update DIN ang pinagmulan:
- Build → **Released**
- Service → **Released**
- Order → **Completed**

Kaya consistent ang status sa lahat ng modules.

---

## 20. Documents

**Menu:** Operations → Documents (o `/documents`)

### Para saan?

**Registry ng printable documents** — para makabuo ka ng pormal na papel anytime: resibo, invoice, quotation, PO, delivery, service receipt.

### Mga uri ng documento (6)

| Document | Para saan |
|---|---|
| **Sales Receipt** | Resibo ng benta sa POS |
| **Invoice** | Pormal na bill |
| **Quotation** | Presyuhan |
| **Purchase Order** | PO sa supplier |
| **Delivery / Release** | Document for handover |
| **Service Receipt** | Resibo ng serbisyo |

### Bawat document ay may

- Company header (pangalan, address, TIN, contact)
- Document number, status, date
- Party info (customer/supplier)
- Line items (description, SKU, qty, price)
- Totals (subtotal, discount, tax)
- Footer warning: **"DEMO DOCUMENT — NOT A VALID BIR RECEIPT"**

### Paano gamitin

- I-click ang **Print** button → browser print dialog
- Naka-CSS-print-ready na ang layout (malinis pag naka-print)

> Nota: Sa ngayon preview/print lang. Hindi pa konektado sa thermal printer o BIR-certified system.

---

## 21. Reports

**Menu:** Analytics → Reports (o `/reports`)

### Para saan?

Para sa **business intelligence** — tingnan ang performance ng tindahan: kita, margin, inventory value, cashier performance, atbp. Dito ka magde-decide kung ano ang dapat i-restock at sino ang best performer.

### Mga Section

| Report | Makikita mo |
|---|---|
| **Sales** | Kita, bilang ng orders, average order value |
| **Margin** | Gross profit (cost data — owner/admin lang ang makakakita) |
| **Inventory** | Kabuuang halaga ng stock (retail at cost), low stock items |
| **Cashier Performance** | Magkano ang nadala ng bawat cashier |
| **Service Output** | Kitang galing sa services |
| **Low Stock** | Anong dapat i-order |
| **Dead Stock** | Anong hindi kumikilos (maaring discount) |

### Filters

- **Time range**: Today, 7 Days, 30 Days, This Month, Custom Range
- **Category**: Per category lang
- **Product**: Specific product
- **Order type**: retail, service, custom build

### Export

- **CSV** — download ng lahat ng data as spreadsheet file
- **JSON** — download ng raw data (para sa integration/programming)

Filename: `dpc-nexus-{topic}-{date}.csv/json`

---

## 22. Settings

**Menu:** System → Settings (o `/settings`)

### Para saan?

Mga preference ng buong system at demo data management.

### Sections

| Section | Ano ang pwedeng gawin |
|---|---|
| **Company Profile** | Preview ng info ng tindahan (name, address, TIN, contact) |
| **Theme** | Switch light / dark mode |
| **Sidebar** | I-collapse/expand navigation |
| **Demo Data** | Reset ang lahat ng data pabalik sa default |

### Reset Demo Data

May dalawang button:
- **Reset Demo Data** — ibabalik sa default ang main data (products, orders, builds, etc.)
- **Reset Ops Data** — ibabalik sa default ang operations data (suppliers, POs, shifts, etc.)

**Importante:** Ito ang «fresh start» button — ginagamit kapag gusto mong i-clear ang lahat ng test/nagulo na data. Same user session at sidebar preferences ang nananatili.

---

## 23. Audit Log

**Menu:** System → Audit Log (o `/audit`)
**Access:** Owner lang

### Para saan?

**Complete history ng lahat ng ginawa sa system** — sino, kailan, ano. Ito ang "black box" ng app — hindi pwedeng maitago ang nagawang aksyon. Kailangan ito sa tamang pamamahala at pagtawag na may pananagutan.

### Bawat entry ay may

| Field | Ibig sabihin |
|---|---|
| Timestamp | Kailan |
| Actor | Sino ang gumawa |
| Role | Anong role niya |
| Action | Ano ang ginawa |
| Entity | Ano ang affected (order, product, etc.) |
| Entity ID | Anong specific record |
| Details | Extra info |

### Ang mga halimbawa ng na-la-log

- "Justine completed order DPC-10482"
- "Dana adjusted inventory quantity"
- "Paolo converted quote QT-10245 to order"
- "Mark marked build QA as passed"

### Paano gamitin

- Malalang na filter by actor, role, action type, o entity
- Merong stats sa itaas (total entries, entries today, unique actors)

---

## 24. Notifications

**Lokasyon:** Bell icon sa itaas (topbar)

### Para saan?

Para abisuhan ka ng mahahalagang pangyayari — NANG WALANG manual na pagtingin.

### Anu-anong notifications

| Type | Halimbawa |
|---|---|
| Low stock | "RTX 5070 is low on stock" |
| Quote approved | "Customer approved quote QT-10245" |
| Build ready | "Build BUILD-10482 is ready for release" |
| Warranty expiring | "5 warranties expiring soon" |
| Service updated | "Service ticket updated" |
| Payment completed | "Payment received for DPC-10482" |

### Priority levels

| Level | Kulay | Kailan |
|---|---|---|
| **Critical** | Pula | QA test failed, out of stock, malubhang problema |
| **High** | Orange | Quote approved, build ready |
| **Normal** | Blue/Slay | General updates |

### Paano gamitin

- I-click ang **bell icon** — may unread count badge
- Tingnan ang kamakailang notifications
- I-click ang isang notification → dadalhin ka sa related entity
- **Mark all read** button para i-clear ang badge

---

## 25. Command Palette & Shortcuts

**Trigger:** `Ctrl+K` / `⌘K` (o mag-click sa search sa topbar)

### Para saan?

Para sa **bilis** — sa halip na mag-click-click sa menu, mag-type ka lang at mabilis kang mapupunta kung saan mo kailangan.

### Quick actions

| Type | Pinupuntahan |
|---|---|
| `new sale` | POS |
| `new quote` | Quotes |
| `new customer` | Customers |
| `new service` | Services |
| `new product` | Products |

### Pag-navigate

Mag-type ng: `dashboard`, `orders`, `inventory`, `builds`, `reports`, atbp.

### Pag-search

Mag-type ng:
- Product name o SKU → `/products/...`
- Order number (hal. `DPC-10482`) → `/orders/...`
- Customer name → `/customers/...`
- Serial number → /products/...

### Keyboard shortcuts

| Key | Ginagawa |
|---|---|
| `Ctrl+K` / `⌘K` | Buksan ang command palette |
| `F1` | Deretso sa POS |
| `F2` | Focus ang search sa POS |
| `Escape` | Isara ang dialog |

> Hindi pa naka-wire: F3 (Customer), F4 (Hold Sale), F5 (Checkout) — nakaplano pa lang.

---

## Kanang malaman (Buod)

### Ang 6 pangunahing workflows

| Workflow | Flow |
|---|---|
| **Benta** | POS → cart → payment → order → resibo |
| **Custom Build** | Build → compatibility → quote → approve → order → assembly → QA → ready → release |
| **Repair** | Ticket → diagnose → parts → repairable → ready → release |
| **Restock** | Low stock → PO → supplier confirm → receive → stock up |
| **Return** | Request → inspect → approve → refund/replace → restock |
| **Cash Out** | Open shift → sales → adjustments → close → variance check |

### Demo-only caveats

- Lahat ng data ay nasa **localStorage ng browser** — hindi pa sa server
- Ang login, payment, at status changes ay **simulation lang**
- Hindi pa BIR-valid ang documents
- Hindi pa naka-connect sa WooCommerce, Supabase, o anumang backend

---

*Feature guide generated from codebase analysis. Last updated: September 2026.*
*DPC Nexus v0.1 — Frontend Demo Build*