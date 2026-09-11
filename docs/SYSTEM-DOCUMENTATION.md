# DPC NEXUS — Complete System Documentation

> **Dream PC Build & IT Solutions — PC Retail & Operations Platform**
> Version: Demo 0.1 | Frontend-Only | localStorage Persistence

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Application Architecture](#3-application-architecture)
4. [Design System & Visual Language](#4-design-system--visual-language)
5. [Authentication & Role-Based Access](#5-authentication--role-based-access)
6. [Navigation & Routing](#6-navigation--routing)
7. [Command Palette & Keyboard Shortcuts](#7-command-palette--keyboard-shortcuts)
8. [Dashboard](#8-dashboard)
9. [Point of Sale (POS)](#9-point-of-sale-pos)
10. [Orders](#10-orders)
11. [Quotes](#11-quotes)
12. [Returns / RMA](#12-returns--rma)
13. [Cash Drawer & Shifts](#13-cash-drawer--shifts)
14. [Products & Catalog](#14-products--catalog)
15. [Inventory Management](#15-inventory-management)
16. [Serial Numbers](#16-serial-numbers)
17. [Custom Builds](#17-custom-builds)
18. [Assembly & Kanban](#18-assembly--kanban)
19. [Purchasing](#19-purchasing)
20. [Suppliers](#20-suppliers)
21. [Receiving / Goods Receipts](#21-receiving--goods-receipts)
22. [Customers](#22-customers)
23. [Services / Repair](#23-services--repair)
24. [Warranty & Claims](#24-warranty--claims)
25. [Releases / Handover](#25-releases--handover)
26. [Documents & Print](#26-documents--print)
27. [Reports & Analytics](#27-reports--analytics)
28. [Settings](#28-settings)
29. [Audit Log](#29-audit-log)
30. [Notifications](#30-notifications)
31. [Data Architecture & Type System](#31-data-architecture--type-system)
32. [State Management & Persistence](#32-state-management--persistence)
33. [Cross-Module Workflows](#33-cross-module-workflows)
34. [Compatibility Engine](#34-compatibility-engine)
35. [Demo Data Reference](#35-demo-data-reference)
36. [Known Limitations](#36-known-limitations)
37. [Future Backend Integration](#37-future-backend-integration)
38. [WooCommerce / WordPress Integration Notes](#38-woocommerce--wordpress-integration-notes)

---

## 1. System Overview

**DPC Nexus** is a frontend-first Point of Sale and operations platform designed for **Dream PC Build & IT Solutions**, a professional PC custom-build and IT solutions company based in the Philippines.

### What It Does

The platform manages the complete lifecycle of a PC retail and custom-build business:

```
Customer → Consultation → Custom Build → Compatibility Check → Quote →
Customer Approval → Sale → Inventory Reservation → Assembly →
QA Testing → Ready for Release → Customer Pickup/Release → Warranty/Service
```

### Core Business Domains

| Domain | What It Covers |
|---|---|
| **Sales** | POS, orders, quotes, returns |
| **Inventory** | Products, stock levels, serial numbers, purchasing, suppliers, receiving |
| **Custom Builds** | Build configuration, component compatibility, assembly kanban, QA testing |
| **Customer Service** | Customer profiles, repair/service tickets, warranty claims |
| **Operations** | Cash drawer/shifts, releases/handover, document generation |
| **Analytics** | Reports, audit log, notifications |
| **System** | Settings, demo data management |

### Current State

- **Frontend-only** — no real backend, no real authentication, no real payments
- All data persists in **localStorage** (two stores)
- Two demo stores: `dpc-nexus-demo-v1` (main) and `dpc-nexus-ops-v1` (operations)
- Designed to be connected to a real backend (Supabase, WooCommerce, or custom API) without rewriting the UI

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR) |
| Routing | TanStack Router (file-based) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI + shadcn/ui |
| Charts | Recharts |
| Animations | GSAP + ScrollTrigger + Lenis smooth scroll |
| Toast Notifications | Sonner |
| Icons | Lucide React |
| Build Tool | Vite |
| Persistence | localStorage (schema-versioned) |

---

## 3. Application Architecture

### File Structure

```
src/
├── routes/                    # File-based routes (TanStack Router)
│   ├── __root.tsx             # Root: providers, 404, error boundary
│   ├── index.tsx              # Login page
│   └── _app.tsx               # App shell (auth gate, sidebar, topbar)
│       ├── _app.dashboard.tsx
│       ├── _app.pos.tsx
│       ├── _app.orders.index.tsx
│       ├── _app.orders.$orderId.tsx
│       ├── _app.quotes.index.tsx
│       ├── _app.quotes.$quoteId.tsx
│       ├── _app.returns.index.tsx
│       ├── _app.returns.$returnId.tsx
│       ├── _app.shifts.index.tsx
│       ├── _app.shifts.$shiftId.tsx
│       ├── _app.products.index.tsx
│       ├── _app.products.$productId.tsx
│       ├── _app.inventory.index.tsx
│       ├── _app.inventory.$productId.tsx
│       ├── _app.serials.tsx
│       ├── _app.builds.index.tsx
│       ├── _app.builds.$buildId.tsx
│       ├── _app.assembly.tsx
│       ├── _app.purchasing.index.tsx
│       ├── _app.purchasing.$poId.tsx
│       ├── _app.suppliers.index.tsx
│       ├── _app.suppliers.$supplierId.tsx
│       ├── _app.receiving.index.tsx
│       ├── _app.receiving.$receiptId.tsx
│       ├── _app.customers.index.tsx
│       ├── _app.customers.$customerId.tsx
│       ├── _app.services.index.tsx
│       ├── _app.services.$ticketId.tsx
│       ├── _app.warranty.index.tsx
│       ├── _app.warranty.$warrantyId.tsx
│       ├── _app.warranty.claims.$claimId.tsx
│       ├── _app.releases.index.tsx
│       ├── _app.releases.$releaseId.tsx
│       ├── _app.documents.tsx
│       ├── _app.reports.tsx
│       ├── _app.settings.tsx
│       └── _app.audit.tsx
├── components/
│   ├── app/                   # App shell components
│   │   ├── app-sidebar.tsx
│   │   ├── app-topbar.tsx
│   │   ├── command-palette.tsx
│   │   └── nav-config.tsx
│   ├── pos/                   # POS-specific components
│   │   ├── product-browser.tsx
│   │   ├── cart-panel.tsx
│   │   ├── customer-select.tsx
│   │   └── payment-dialog.tsx
│   ├── products/              # Product management
│   ├── inventory/             # Inventory management
│   ├── services/              # Service ticket editor
│   ├── returns/               # Return dialog
│   ├── purchasing/            # PO dialog
│   ├── suppliers/             # Supplier form
│   ├── releases/              # Release dialog
│   ├── nexus/                 # Shared design system components
│   │   ├── PageHeader.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DataTable.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Timeline.tsx
│   │   ├── Detail.tsx
│   │   ├── Primitives.tsx     # Panel, EmptyState, ErrorState, skeletons
│   │   ├── sales-chart.tsx
│   │   ├── document.tsx       # Document preview + print
│   │   └── motion.tsx         # GSAP motion helpers
│   ├── ui/                    # Radix/shadcn primitives
│   └── brand/                 # Logo/wordmark
├── lib/
│   ├── store.tsx              # Main data store (React Context)
│   ├── ops-store.tsx          # Operations store (React Context)
│   ├── types.ts               # Core domain types
│   ├── ops-types.ts           # Operations domain types
│   ├── permissions.ts         # RBAC matrix
│   ├── demo-data.ts           # Main demo seed data
│   ├── ops-data.ts            # Operations demo seed data
│   ├── format.ts              # Currency/date formatting
│   ├── compatibility.ts       # Build compatibility engine
│   ├── build-state.ts         # Build stage ↔ status mapping
│   ├── build-sync.ts          # Cross-store build event bus
│   ├── release-complete.ts    # Release propagation logic
│   ├── motion.ts              # GSAP registration
│   ├── utils.ts               # Utility helpers
│   ├── error-page.ts          # SSR error fallback
│   ├── error-capture.ts       # Error capture utilities
│   └── lovable-error-reporting.ts  # Lovable telemetry
└── integrations/              # (empty — no backend yet)
```

### Data Flow

```
┌─────────────────────────────────────────────┐
│                  UI Layer                    │
│  (Routes, Components, Dialogs)              │
└──────────────────┬──────────────────────────┘
                   │ useStore() / useOps()
┌──────────────────▼──────────────────────────┐
│              State Layer                     │
│  ┌─────────────┐  ┌──────────────────┐      │
│  │  StoreProvider│  │  OpsProvider     │      │
│  │  (Main)      │  │  (Operations)    │      │
│  └──────┬──────┘  └────────┬─────────┘      │
│         │                  │                 │
│         ▼                  ▼                 │
│  ┌──────────────────────────────────┐       │
│  │         localStorage             │       │
│  │  dpc-nexus-demo-v1              │       │
│  │  dpc-nexus-ops-v1               │       │
│  └──────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

### Two-Store Design

| Store | localStorage Key | Contains |
|---|---|---|
| **Main Store** | `dpc-nexus-demo-v1` | Users, categories, products, inventory, serials, customers, orders, quotes, builds, services, warranties, claims, movements, audit, notifications, cart, theme |
| **Ops Store** | `dpc-nexus-ops-v1` | Suppliers, purchase orders, goods receipts, returns, shifts, build-ops (assembly steps, tests, QA), releases, company profile |

The two stores are connected via a **build-sync event bus** (`build-sync.ts`) that propagates build status changes between them.

---

## 4. Design System & Visual Language

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#09090B` | Page background |
| Surface | `#111113` | Card/panel background |
| Elevated | `#18181B` | Hover states, elevated surfaces |
| Border | `#27272A` | Borders, dividers |
| Primary text | `#FAFAFA` | Headings, primary text |
| Secondary text | `#A1A1AA` | Descriptions, secondary info |
| Muted text | `#71717A` | Metadata, disabled states |

### Typography

- **Primary font**: Inter (sans-serif) — UI text
- **Monospace font**: JetBrains Mono — SKU, serial numbers, order IDs, technical identifiers
- Examples: `DPC-10482`, `GPU-RTX5070`, `SN: 8C2A-91F4`

### Design Principles

- Dark, minimal, technical, premium
- Information-dense but not cluttered
- Purpose-built for PC hardware retail
- No excessive gradients, glassmorphism, or emoji icons
- Professional Lucide icon set throughout

### Shared Components (nexus/)

| Component | Purpose |
|---|---|
| `PageHeader` | Page title + description + actions |
| `StatCard` | KPI card with animated count-up |
| `StatusBadge` | Color-coded status pill for every entity status |
| `DataTable` | Sortable, paginated table with row hover |
| `Toolbar` | Search, filter, segmented controls, result count |
| `Timeline` | Vertical event timeline for orders/builds/services |
| `Detail` | Key-value pairs, sections, totals, progress bars |
| `Panel` | Consistent card/container wrapper |
| `EmptyState` | "No data" placeholder with action button |
| `ErrorState` | Error message with retry button |
| `SalesChart` | Recharts area chart with range tabs |
| `DocumentPreview` | Print-ready document preview |
| `PrintButton` | Browser print trigger |

---

## 5. Authentication & Role-Based Access

### Demo Users

| Role | Name | Email | Password | Home Page |
|---|---|---|---|---|
| Owner | Justine Ramos | demo@dpcnexus.local | `demo1234` | `/dashboard` |
| Admin | Mika Santos | admin@dpcnexus.local | `admin1234` | `/dashboard` |
| Cashier | Paolo Cruz | cashier@dpcnexus.local | `cashier1234` | `/pos` |
| Inventory Staff | Dana Lim | stock@dpcnexus.local | `stock1234` | `/inventory` |

### Capability Matrix (22 Capabilities)

| Capability | Owner | Admin | Cashier | Inventory |
|---|---|---|---|---|
| `pos` | ✓ | ✓ | ✓ | — |
| `orders` | ✓ | ✓ | ✓ | ✓ |
| `quotes` | ✓ | ✓ | ✓ | — |
| `customers` | ✓ | ✓ | ✓ | — |
| `products` | ✓ | ✓ | ✓ | ✓ |
| `inventory` | ✓ | ✓ | — | ✓ |
| `inventory.adjust` | ✓ | ✓ | — | ✓ |
| `builds` | ✓ | ✓ | — | — |
| `builds.qa` | ✓ | ✓ | — | — |
| `assembly` | ✓ | ✓ | — | — |
| `services` | ✓ | ✓ | — | — |
| `warranty` | ✓ | ✓ | — | — |
| `reports` | ✓ | ✓ | — | — |
| `settings` | ✓ | ✓ | — | — |
| `costs` | ✓ | ✓ | — | — |
| `purchasing` | ✓ | ✓ | — | ✓ |
| `receiving` | ✓ | ✓ | — | ✓ |
| `returns` | ✓ | ✓ | ✓ | ✓ |
| `shifts` | ✓ | ✓ | ✓ | — |
| `releases` | ✓ | ✓ | ✓ | — |
| `documents` | ✓ | ✓ | ✓ | ✓ |
| `audit` | ✓ | — | — | — |

> Note: `suppliers` is not a separate capability — it's covered by `purchasing`. There's no dedicated `technician` role; the 4 roles are Owner, Admin, Cashier, Inventory Staff.

### How RBAC Works

1. On login, the user's **role** is stored in state
2. The sidebar **filters nav items** based on the role's allowed capabilities
3. The app shell (`_app.tsx`) checks if the current URL requires a capability the user doesn't have — if so, redirects to their home page with a toast
4. Cost information (product cost, margin) is hidden from non-owner/admin roles
5. Inventory adjustment controls are gated by `inventory.adjust`

> **Note:** This is UI-level only. Real authorization must be enforced server-side when a backend is added.

---

## 6. Navigation & Routing

### Sidebar Groups

```
OVERVIEW
  └── Dashboard                    /dashboard

SALES
  ├── Point of Sale                /pos
  ├── Orders                       /orders
  ├── Quotes                       /quotes
  ├── Returns                      /returns
  └── Cash Drawer                  /shifts

INVENTORY
  ├── Products                     /products
  ├── Inventory                    /inventory
  ├── Serial Numbers               /serials
  ├── Custom Builds                /builds
  ├── Assembly                     /assembly
  ├── Purchasing                   /purchasing
  ├── Suppliers                    /suppliers
  └── Receiving                    /receiving

CUSTOMERS
  ├── Customers                    /customers
  ├── Services                     /services
  ├── Warranty                     /warranty
  └── Releases                     /releases

OPERATIONS
  └── Documents                    /documents

ANALYTICS
  └── Reports                      /reports

SYSTEM
  ├── Settings                     /settings
  └── Audit Log                    /audit
```

**Total: 22 navigation items across 7 groups.**

### Sidebar Behavior

- **Expanded**: Icons + labels, group headers visible
- **Collapsed**: Icon-only rail with tooltips on hover
- Active route highlighted
- User profile + sign out at bottom
- "DEMO MODE" badge

### Topbar

- Page title (auto from nav config)
- Breadcrumbs (where applicable)
- Global search button (triggers ⌘K)
- Light/dark theme toggle
- Notifications bell with unread count badge
- "Demo mode" indicator
- Mobile: hamburger → sheet navigation

---

## 7. Command Palette & Keyboard Shortcuts

### Command Palette (Ctrl+K / ⌘K)

Opens a centered overlay with three groups:

**Quick Actions:**
| Action | Route | Shortcut |
|---|---|---|
| New Sale | `/pos` | F1 |
| New Quote | `/quotes` | — |
| New Customer | `/customers?new=1` | — |
| New Service Ticket | `/services?new=1` | — |
| New Product | `/products?new=1` | — |

**Navigate:**
| Destination | Route |
|---|---|
| Dashboard | `/dashboard` |
| Point of Sale | `/pos` |
| Orders | `/orders` |
| Quotes | `/quotes` |
| Inventory | `/inventory` |
| Custom Builds | `/builds` |
| Services | `/services` |
| Warranty Center | `/warranty` |
| Reports | `/reports` |
| Settings | `/settings` |

**Dynamic Search** (query-based, shows matching results):
- Products (matches name, SKU, category)
- Orders (matches ID, customer name)
- Customers (matches name)
- Serial Numbers (matches serial string → links to product)

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+K` / `⌘K` | Open command palette |
| `F1` | Navigate to POS |
| `F2` | Focus POS search input |
| `Escape` | Close dialog/modal |

> **Not yet wired:** F3 (Customer), F4 (Hold Sale), F5 (Checkout) — specified in README but not implemented.

---

## 8. Dashboard

**Route:** `/dashboard`
**Capability:** `orders`
**File:** `src/routes/_app.dashboard.tsx`

### Layout

```
┌─────────────────────────────────────────────────┐
│ Good afternoon, Justine                          │
│ Thursday, September 11, 2026                     │
│ [Search...]  [+ New Sale]                        │
├─────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│ │Today│ │Order│ │Open │ │Build│ │Pend.│ │Low  ││
│ │Sales│ │s    │ │Svc  │ │in   │ │Rtrn │ │Stock││
│ │₱128K│ │24   │ │3    │ │Prgrs│ │2    │ │17   ││
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘│
├─────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐│
│ │   Sales Chart         │ │   Quick Actions      ││
│ │   [Today|7d|30d]     │ │   New Sale           ││
│ │   Area chart          │ │   New Build          ││
│ │                       │ │   View Inventory     ││
│ └──────────────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐│
│ │  Build Pipeline       │ │  Recent Transactions ││
│ │  Active builds by     │ │  Latest orders with  ││
│ │  bench phase          │ │  amounts             ││
│ └──────────────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐│
│ │  Notifications        │ │  Activity Log        ││
│ │  Recent alerts        │ │  Audit trail         ││
│ └──────────────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────┘
```

### KPI Cards

| Metric | Source | Animation |
|---|---|---|
| Today's Sales | Sum of today's order totals | Count-up |
| Orders Today | Count of today's orders | Count-up |
| Open Service Tickets | Services with status != released/cancelled | Count-up |
| Builds in Progress | Builds with status assembly/testing | Count-up |
| Pending Returns | Returns with status requested/inspection | Count-up |
| Low Stock Alerts | Products where onHand <= reorderPoint | Count-up |

### Sales Chart

- **Recharts** area chart
- Range tabs: Today (hourly), 7 Days, 30 Days (daily)
- Shows revenue (line) and order count
- Minimal, professional styling

---

## 9. Point of Sale (POS)

**Route:** `/pos`
**Capability:** `pos`
**File:** `src/routes/_app.pos.tsx`

The POS is the most critical module. It's a **two-panel layout** optimized for speed in a retail environment.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  POINT OF SALE                           [Hold] [Clear]     │
├────────────────────────────────┬────────────────────────────┤
│  PRODUCT BROWSER               │  CART                      │
│  ┌────────────────────────┐    │  ┌──────────────────────┐  │
│  │ [Search products...]   │    │  │ RTX 5070 Gaming OC   │  │
│  │ [All][CPU][GPU][RAM].. │    │  │ SKU: GPU-RTX5070     │  │
│  ├────────────────────────┤    │  │ Qty: 1  ₱42,500      │  │
│  │ AMD Ryzen 7 7800X3D    │    │  │ [Serial: SN-xxx]     │  │
│  │ CPU-AMD-7800X3D        │    │  ├──────────────────────┤  │
│  │ ₱21,500  Stock: 4      │    │  │ Kingston Fury 32GB   │  │
│  ├────────────────────────┤    │  │ Qty: 2  ₱8,500       │  │
│  │ RTX 5070 Gaming OC     │    │  ├──────────────────────┤  │
│  │ GPU-RTX5070            │    │  │                      │  │
│  │ ₱42,500  Stock: 3      │    │  │ Subtotal:  ₱51,000  │  │
│  ├────────────────────────┤    │  │ Discount:  ₱0        │  │
│  │ ...                    │    │  │ VAT (12%): ₱6,120    │  │
│  │ [Grid] [List]          │    │  │ Total:      ₱57,120  │  │
│  └────────────────────────┘    │  │                      │  │
│                                │  │ Customer: Walk-in ▼   │  │
│                                │  │ [Checkout]            │  │
│                                │  └──────────────────────┘  │
└────────────────────────────────┴────────────────────────────┘
```

### Product Browser

- **Grid/List toggle** view
- **Category chips** for filtering (CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooling, Fans, Monitor, Keyboard, Mouse, Headset, Networking, Accessories, Software, Services)
- **Search** by product name, SKU, or brand
- **Stock badges**: `OUT OF STOCK` (red), `SERVICE` (cyan), `n IN STOCK` (green)
- Click to add to cart
- Services shown with special badge (infinite stock)

### Cart Panel

- **Line items** with product name, SKU, quantity controls (+/-), price
- **Stock guard**: Cannot add more than available
- **Serial picker** for serial-tracked items (select from in-stock serials or type manually)
- **Discount input** (cart-level)
- **Sale notes** (optional text)
- **Held transactions** list (park and resume)
- **Customer selector** (walk-in default, searchable, or create new)
- **Totals footer**: Subtotal → Discount → VAT (12%) → Total

### Cart Flow

1. Browse/search products → click to add
2. Adjust quantities (stock-guarded)
3. Optionally select serial numbers for tracked items
4. Optionally attach a customer
5. Optionally add discount
6. Click Checkout

### Payment Dialog

**File:** `src/components/pos/payment-dialog.tsx`

**Payment Methods:**
| Method | Fields |
|---|---|
| Cash | Tendered amount, quick-tender chips (round-up to ₱500, ₱1,000, ₱5,000 denominations), change display |
| GCash | Reference number (required) |
| Bank Transfer | Reference number (required) |
| Card | Reference number (required) |

**Guards:**
- Cash: tendered must be ≥ total (shows "short by" if not enough)
- Non-cash: reference number is required
- Cannot complete if cart is empty

### Checkout Pipeline (`completeSale`)

When payment is confirmed:

1. Compute totals (subtotal, discount, tax, total)
2. Create `Order` with status `paid`, sequential `DPC-<n>` ID
3. For each cart line:
   - Decrement `onHand` in inventory
   - Increment `sold` count
   - Create `sold` inventory movement
   - If serial-tracked: mark each serial as `sold`, set `warrantyUntil` (product's warrantyMonths)
4. Auto-create a `Warranty` record per sold serial
5. Create payment record with method and amount
6. Append to order timeline
7. Create notification (payment received)
8. Write audit log entry
9. Clear cart

### Held Carts

- **Hold** (`holdCart`): Parks current cart with timestamp into `heldCarts[]`, clears active cart
- **Resume** (`resumeHeldCart`): Restores a held cart by ID, removes from held list
- Displayed as a list in the cart panel with timestamp

### Post-Sale Success State

```
✓ Sale Completed
Order #DPC-10482
Total: ₱87,450

[View Order]  [Print Receipt]  [New Sale]
```

---

## 10. Orders

**Route:** `/orders` (list), `/orders/:orderId` (detail)
**Capability:** `orders`
**Files:** `src/routes/_app.orders.index.tsx`, `src/routes/_app.orders.$orderId.tsx`

### Order List

- **Search** by order ID, customer name, or cashier name
- **Status filter** dropdown
- **Date range filter**
- **Per-status stat cards** at top
- Sortable, paginated table

### Order Statuses

| Status | Description |
|---|---|
| `pending` | Order created, awaiting payment |
| `paid` | Payment received (default from POS) |
| `processing` | Being prepared |
| `assembly` | Custom build being assembled |
| `testing` | QA testing in progress |
| `ready` | Ready for pickup/delivery |
| `completed` | Fully completed |
| `cancelled` | Cancelled |
| `refunded` | Refunded |

### Order Types (derived)

| Type | Source |
|---|---|
| `retail` | Standard POS sale |
| `service` | Created from a service ticket |
| `custom_build` | Created from a quote or build |

### Order Detail

```
┌──────────────────────────────────────────────┐
│  ORDER #DPC-10482                [Status ▼]  │
│  Sep 11, 2026 • Juan Dela Cruz               │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Items         │  │ Payment Summary      │  │
│  │ RTX 5070 x1  │  │ Subtotal: ₱42,500   │  │
│  │ ₱42,500      │  │ Discount: ₱0        │  │
│  │              │  │ VAT:      ₱5,100    │  │
│  │ Kingston x2  │  │ Total:    ₱47,600   │  │
│  │ ₱8,500       │  │                      │  │
│  │              │  │ Payment: Cash        │  │
│  │              │  │ Tendered: ₱50,000   │  │
│  │              │  │ Change:   ₱2,400    │  │
│  └──────────────┘  └──────────────────────┘  │
├──────────────────────────────────────────────┤
│  Timeline                                    │
│  ✓ Order created          Sep 11, 10:30 AM   │
│  ✓ Payment received       Sep 11, 10:31 AM   │
│  ✓ Processing started     Sep 11, 11:00 AM   │
│  ...                                         │
├──────────────────────────────────────────────┤
│  Notes: Customer requested gift wrap          │
│  Serial Numbers: SN-001, SN-002              │
│  Warranty: WR-20452 (12 months)              │
└──────────────────────────────────────────────┘
```

### Status Transitions

Status changes append a timeline event and are audit-logged. The `updateOrderStatus` function handles all transitions.

---

## 11. Quotes

**Route:** `/quotes` (list), `/quotes/:quoteId` (detail)
**Capability:** `quotes`
**Files:** `src/routes/_app.quotes.index.tsx`, `src/routes/_app.quotes.$quoteId.tsx`

### Quote Lifecycle

```
Draft → Sent → Pending → Approved → Converted to Order
                              ↓
                          Rejected
                              ↓
                          Expired
```

### Quote Statuses

| Status | Description |
|---|---|
| `draft` | Being created/edited |
| `sent` | Sent to customer |
| `pending` | Awaiting customer response |
| `approved` | Customer approved |
| `rejected` | Customer declined |
| `expired` | Past expiration date |
| `converted` | Converted to order |

### Creating a Quote (`createQuote`)

Parameters:
- `customerId` — who the quote is for
- `items[]` — array of `{ productId, qty }`
- `discount` — optional discount amount
- `serviceTotal` — optional service/labor total
- `notes` — optional notes
- `expiresInDays` — expiration period (default 14)

Auto-generates `QT-<n>` ID with computed totals.

### Quote from Build (`quoteFromBuild`)

Converts a build's components + services into a quote:
- Each component becomes a quote line
- Build services (Assembly, Windows install, Cable management) become the service total
- Sets 14-day expiry
- Links the quote to the build
- Sets build status to `quoted`

### Sending a Quote to the Customer (`updateQuote` + `sendQuote`)

**Files:** `src/components/quotes/quote-editor-dialog.tsx`, `src/components/quotes/quote-message.tsx`

**PDF export:** `src/lib/quote-pdf.ts` (+ `src/components/quotes/quote-pdf-dialog.tsx`) generates a real A4 PDF of the whole quotation via `jspdf` — **company logo** (loaded from `/dpc-logo.png` as a base64 data URI), company header, customer block, the cover message/subject (if set), item table (qty/unit/amount), totals, notes and DEMO notice — exposed as a blob-URL preview (iframe), `Download PDF` (`doc.save`) and `Open in browser`. Launched from the "View PDF" button on the quote detail page and as **step 3 ("Check PDF & send")** of the editor wizard, so the admin verifies the actual PDF layout before sending.

A combined **"Edit & send"** editor dialog is launched from:
- The quotes dashboard — every row has an **Editor** button (sets `editorId` in `_app.quotes.index.tsx`)
- The quote detail page — the "Send to customer" / "Resend / edit message" buttons

The wizard has three steps:

1. **Quotation (edit everything)** — admin picks the customer, then edits the full quotation:
   - Item lines (product select, quantity, per-unit price — defaults to the product price)
   - Line add/remove
   - Discount amount
   - Service / labor total
   - Notes
   - Validity in days
   - Live totals summary recomputed via `computeTotals`
2. **Message** — editable `subject` + cover `message` with a live client-facing `QuoteClientMessage` preview
3. **Check PDF & send** — the actual A4 PDF (with the company logo, cover message and edited quotation) is generated live via `createQuotePdf` and shown in an iframe, then **Send to customer** (simulated e-mail).

`updateQuote(quoteId, edits)` where `edits` is `{ customerId?, items?, discount?, serviceTotal?, notes?, expiresInDays? }`:
1. Recomputes totals via `computeTotals`
2. Re-derives `customerName` from `customerId` (or keeps the existing one)
3. Recomputes `expiresAt` from `expiresInDays` (default: keep existing)
4. Emits an audit log entry

`sendQuote(quoteId, { subject, message })`:
1. Sets quote status → `sent`
2. Stores `subject`, `message`, and `sentAt` on the quote
3. Emits an audit log entry
4. Creates a `quote` notification

Extra quote fields used by the send flow:
- `subject?: string` — email-style subject line
- `message?: string` — free-form cover message body
- `sentAt?: string` — ISO timestamp of when the quote was sent

The read-only **"Message sent to the client"** panel on the quote detail page re-renders `QuoteClientMessage` when `quote.message` exists.

### Converting Quote to Order (`convertQuoteToOrder`)

**Critical workflow:**

1. Creates a new `Order` with status `pending`
2. For each quote line:
   - Creates order item
   - If product is serial-tracked: reserves available serials (status → `reserved`)
   - Increments `reserved` count in inventory
3. Links the order to the quote
4. If the quote was from a build: sets build status to `parts_reserved`
5. Emits a build-sync event
6. Sets quote status to `converted`
7. Returns the new order

---

## 12. Returns / RMA

**Route:** `/returns` (list), `/returns/:returnId` (detail)
**Capability:** `returns`
**Files:** `src/routes/_app.returns.index.tsx`, `src/routes/_app.returns.$returnId.tsx`, `src/components/returns/new-return-dialog.tsx`

### Return Lifecycle

```
Requested → Inspection → Approved → Refunded / Replaced
                     ↓
                  Rejected
```

### Return Statuses

| Status | Description |
|---|---|
| `requested` | Customer requested a return |
| `inspection` | Being inspected |
| `approved` | Return approved |
| `rejected` | Return denied |
| `refunded` | Refund processed |
| `replaced` | Item replaced |

### Creating a Return (`createReturn`)

Parameters:
- `orderId` — original order
- `productId` — product being returned
- `serialId` — optional serial number
- `qty` — quantity
- `reason` — return reason
- `condition` — item condition
- `refundMethod` — how to refund

### One-Time Restock Guard

When a return is approved/refunded:
- The product's `onHand` is restored
- A `returned` inventory movement is recorded
- The return record is stamped with `restockedAt`
- **Double-restock prevention**: if `restockedAt` is already set, the stock adjustment is skipped

---

## 13. Cash Drawer & Shifts

**Route:** `/shifts` (list), `/shifts/:shiftId` (detail)
**Capability:** `shifts`
**Files:** `src/routes/_app.shifts.index.tsx`, `src/routes/_app.shifts.$shiftId.tsx`

### Shift Lifecycle

```
Open → Closed
```

### Opening a Shift (`openNewShift`)

- Sets `openingCash` (initial float)
- Records `cashier` name
- Auto-closes any currently open shift
- Generates `SH-<n>` ID

### During a Shift

**Cash Adjustments** (`addCashAdjustment`):
- `cash_in` — money added to drawer (e.g., extra change)
- `cash_out` — money removed (e.g., bank deposit)

### Closing a Shift (`closeShift`)

Parameters:
- `countedCash` — actual cash in drawer
- `tenders` — breakdown by payment method (cash, GCash, bank, card)
- `refunds` — total refunds processed
- `notes` — optional notes

### Expected Cash Formula

```
expectedCash = openingCash + cashSales + ΣcashAdjustments − cashRefunds
```

### Variance

```
variance = countedCash − expectedCash
```

Positive variance = overage, Negative = shortage.

### Shift Detail Shows

- Opening/closing timestamps
- Cashier name
- Opening cash
- Expected cash vs counted cash
- Variance (highlighted if non-zero)
- Cash adjustments list
- Tender breakdown by payment method
- Refund total

---

## 14. Products & Catalog

**Route:** `/products` (list), `/products/:productId` (detail)
**Capability:** `products`
**Files:** `src/routes/_app.products.index.tsx`, `src/routes/_app.products.$productId.tsx`, `src/components/products/product-form-dialog.tsx`

### Product Types

| Type | Description |
|---|---|
| `product` | Physical item (stock-tracked) |
| `service` | Service/labor (infinite stock) |
| `bundle` | Product bundle |

### Product Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated |
| `name` | string | Product name |
| `sku` | string | Stock Keeping Unit (unique) |
| `brand` | string | Manufacturer brand |
| `categoryId` | string | Category reference |
| `type` | product/service/bundle | Product type |
| `price` | number | Selling price (PHP) |
| `cost` | number | Cost price (PHP, owner/admin only) |
| `serialTracked` | boolean | Requires serial number tracking |
| `warrantyMonths` | number | Warranty period in months |
| `location` | string | Storage location |
| `supplier` | string | Supplier reference |
| `specs` | object | Technical specifications (varies by category) |
| `archived` | boolean | Soft-delete flag |

### Product Categories (17)

CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooling, Fans, Monitor, Keyboard, Mouse, Headset, Networking, Accessories, Software, Services

### Product CRUD

- **Create** (`createProduct`): Validates unique SKU, valid category; creates inventory record with `onHand` and `reorderPoint`
- **Update** (`updateProduct`): Patches fields; optionally adjusts stock level (creates movement)
- **Archive** (`archiveProduct`): Sets `archived: true` (soft delete)
- **Reactivate** (`reactivateProduct`): Sets `archived: false`
- **Delete** (`deleteProduct`): Permanently removes product + inventory record

### Product List Tabs

- All Products
- Categories (manage categories)
- Archived (soft-deleted products)

### Product Detail Tabs

| Tab | Content |
|---|---|
| Overview | Name, SKU, brand, category, price, cost, specs, warranty, location |
| Inventory | Stock levels, reorder point, adjustment controls |
| Serial Numbers | Registered serials with status |
| Pricing | Cost vs selling price, margin |
| Suppliers | Supplier information |
| Warranty | Warranty period, linked warranties |
| History | Recent inventory movements |

---

## 15. Inventory Management

**Route:** `/inventory` (list), `/inventory/:productId` (detail)
**Capability:** `inventory`
**Files:** `src/routes/_app.inventory.index.tsx`, `src/routes/_app.inventory.$productId.tsx`, `src/components/inventory/adjust-stock-dialog.tsx`

### Stock Model

Instead of a single `quantity` field, inventory uses a multi-state model:

```
On Hand (total physical units)
├── Reserved (allocated to orders/quotes)
├── Available (On Hand - Reserved)
├── Damaged (unusable units)
└── Sold (historical count)
```

**Formula:** `Available = max(0, On Hand - Reserved)`

For services: stock is `Infinity` (unlimited).

### Inventory Table Columns

| Column | Description |
|---|---|
| Product | Name + SKU |
| Category | Product category |
| On Hand | Total physical units |
| Reserved | Units allocated to pending orders |
| Available | On Hand - Reserved |
| Damaged | Unusable units |
| Sold | Historical sold count |
| Status | IN STOCK / LOW STOCK / OUT OF STOCK |
| Price | Selling price |
| Location | Storage location |

### Status Detection

| Status | Condition |
|---|---|
| OUT OF STOCK | `onHand === 0` |
| LOW STOCK | `onHand <= reorderPoint` and `onHand > 0` |
| IN STOCK | `onHand > reorderPoint` |

### Stock Adjustment (`adjustStock`)

- Manual adjustment with a delta (+/-) and reason
- Creates an inventory movement record (`received` for positive, `adjusted` for negative)
- Gated by `inventory.adjust` capability
- Audit-logged

### Inventory Movements

| Movement Type | When |
|---|---|
| `received` | Stock received from supplier or adjustment |
| `reserved` | Stock allocated to an order/quote |
| `sold` | Stock sold via POS |
| `adjusted` | Manual stock adjustment |
| `damaged` | Stock marked as damaged |
| `returned` | Stock returned from customer (RMA) |

Each movement records: product, type, quantity, reference (order/build/return ID), date, actor.

---

## 16. Serial Numbers

**Route:** `/serials`
**Capability:** `inventory`
**File:** `src/routes/_app.serials.tsx`

### What Are Serial Numbers

Unique identifiers for individual physical units of serial-tracked products. Enables traceability from purchase → stock → sale/install → warranty → service.

### Serial Statuses

| Status | Description |
|---|---|
| `in_stock` | Available in inventory |
| `reserved` | Allocated to an order/quote |
| `installed` | Installed in a custom build |
| `sold` | Sold to a customer |
| `rma` | Under return/repair |

### Serial Lifecycle

```
Registered (in_stock)
    ↓
Reserved (quote → order)
    ↓
Installed (in build) or Sold (via POS)
    ↓
Warranty active
    ↓
 potential RMA (service claim)
```

### Serial Registration (`registerSerials`)

- Bulk register serial numbers for a product
- Deduplicates case-insensitively
- Creates audit log entry
- Sets initial status: `in_stock`

### Serial Update (`updateSerial`)

Patches: status, orderId, buildId, customerId, warrantyUntil

### Serial Detail Info

Each serial shows:
- Serial number
- Status
- Linked customer
- Linked order/build
- Warranty expiration date

---

## 17. Custom Builds

**Route:** `/builds` (list), `/builds/:buildId` (detail)
**Capability:** `builds`
**Files:** `src/routes/_app.builds.index.tsx`, `src/routes/_app.builds.$buildId.tsx`

### Build Entity

A custom PC build represents a customer's bespoke computer configuration.

| Field | Description |
|---|---|
| Build ID | `BUILD-<n>` |
| Customer | Who it's for |
| Purpose | Gaming, Workstation, Office, etc. |
| Budget | Target budget (PHP) |
| Components | Selected parts by slot |
| Services | Assembly, OS install, Cable mgmt |
| Compatibility | Real-time check results |
| Total Price | Parts + services |
| Status | Current lifecycle stage |
| Notes | Free text |
| QA | Checklist + test results |
| Staff | Assigned technician/QA |

### Build Slots (Component Categories)

| Slot | Category |
|---|---|
| CPU | Processor |
| Motherboard | Main board |
| RAM | Memory |
| GPU | Graphics card |
| Storage | SSD/HDD |
| PSU | Power supply |
| Case | Chassis |
| Cooling | CPU cooler |
| Fans | Case fans |
| OS | Operating System |
| Accessories | Peripherals, misc |
| Services | Labor/service items |

### Build Statuses

| Status | Description |
|---|---|
| `draft` | Initial creation |
| `consultation` | Being discussed with customer |
| `quoted` | Quote generated from build |
| `approved` | Customer approved the build |
| `parts_reserved` | Inventory reserved for this build |
| `assembly` | Being assembled |
| `testing` | QA testing in progress |
| `ready` | Build complete, ready for release |
| `released` | Delivered to customer |
| `cancelled` | Build cancelled |

### Build Lifecycle

```
Draft → Consultation → Quoted → Approved → Parts Reserved →
Assembly → Testing → Ready → Released
```

### Creating a Build (`createBuild`)

Parameters: `customerId`, `purpose`, `budget`, `notes`

Auto-creates default services:
- Assembly: ₱2,500
- Windows Installation: ₱1,000
- Cable Management: ₱500

### Adding Components (`addBuildComponent`)

- Select a slot (CPU, GPU, etc.)
- Pick a product from inventory
- Quantity (default 1)
- If component already exists in slot, increments quantity

### Build Summary

```
Parts Total:        ₱91,450
Assembly:           ₱2,500
Windows Install:    ₱1,000
Cable Management:   ₱500
───────────────────────────
Grand Total:        ₱95,450
```

### Build Detail Page

```
┌──────────────────────────────────────────────┐
│  BUILD #BUILD-10482          [Status ▼]      │
│  Customer: Juan Dela Cruz                    │
│  Purpose: Gaming Workstation                 │
│  Budget: ₱100,000                            │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Components    │  │ Compatibility        │  │
│  │ CPU: 7800X3D  │  │ ✓ Socket compatible  │  │
│  │ MB: MSI B650M │  │ ✓ RAM compatible     │  │
│  │ RAM: 32GB DDR5│  │ ✓ PSU sufficient     │  │
│  │ GPU: RTX 5070 │  │ ⚠ BIOS may need upd  │  │
│  │ SSD: 1TB NVMe │  │ ✓ GPU selected       │  │
│  │ PSU: 750W     │  │                      │  │
│  │ Case: NR200P  │  │                      │  │
│  └──────────────┘  └──────────────────────┘  │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Services      │  │ QA Checklist         │  │
│  │ Assembly      │  │ □ CPU installed      │  │
│  │ Windows       │  │ □ RAM detected       │  │
│  │ Cable Mgmt    │  │ □ GPU detected       │  │
│  │              │  │ □ POST test          │  │
│  └──────────────┘  └──────────────────────┘  │
├──────────────────────────────────────────────┤
│  Total: ₱95,450                              │
│  Linked Quote: QT-10245                      │
│  Linked Order: DPC-10482                     │
│  Technician: —                               │
│  QA Staff: —                                 │
└──────────────────────────────────────────────┘
```

### Quote from Build (`quoteFromBuild`)

1. Converts all build components → quote lines (product + qty + price)
2. Adds build services as service total
3. Sets 14-day expiry
4. Links quote to build
5. Sets build status to `quoted`

---

## 18. Assembly & Kanban

**Route:** `/assembly`
**Capability:** `assembly`
**File:** `src/routes/_app.assembly.tsx`

### What It Is

A **Kanban board** for tracking custom PC builds through the physical assembly process. Separate from the build status (which is sales-facing), this tracks the **workshop stages**.

### Assembly Stages (13 stages in 4 groups)

**SALES (pre-assembly):**
| Stage | ID |
|---|---|
| Quote | `quote` |
| Approved | `approved` |
| Parts Reserved | `parts_reserved` |

**ASSEMBLY:**
| Stage | ID |
|---|---|
| Cable Management | `cable_management` |
| Component Install | `component_install` |
| BIOS Configuration | `bios` |
| OS Installation | `os_install` |
| Driver Installation | `drivers` |

**VALIDATION:**
| Stage | ID |
|---|---|
| Stress Testing | `stress_test` |
| QA Review | `qa_review` |

**HANDOVER:**
| Stage | ID |
|---|
| Release Prep | `release_prep` |
| Ready | `release` |

### Kanban Board Layout

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ QUOTE    │ APPROVED │ COMPONENT│ BIOS/OS  │ STRESS   │ READY    │
│          │          │ INSTALL  │          │ TEST     │          │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │
│ │Build │ │ │Build │ │ │Build │ │ │Build │ │ │Build │ │ │Build │ │
│ │Card  │ │ │Card  │ │ │Card  │ │ │Card  │ │ │Card  │ │ │Card  │ │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Features

- **Search** by build ID or customer name
- **Technician filter** — filter by assigned staff
- **Quick staff assignment** — assign technician/QA directly from the card
- **Stage progress** — each card shows progress percentage
- **Stage transitions** — drag or click to advance/revert stages

### Build Operations (`BuildOps`)

Each build has an associated `BuildOps` record containing:

**Assembly Checklist** (9 default steps):
1. Motherboard prep
2. CPU install
3. RAM install
4. Storage install
5. GPU install
6. PSU install
7. Cable management
8. BIOS configuration
9. OS installation

**Stress Tests** (5 tests):
1. CPU stress test
2. GPU stress test
3. Memory test
4. Thermal test
5. Stability test

Each test has: `pass` | `fail` | `null` status + optional reading string.

### QA Sign-off (`signQa`)

- Stamps `qaStaff` and `qaSignedAt`
- **Only advances to `ready` if ALL tests passed**
- If any test failed: sends a critical notification

### Stage ↔ Status Mapping

The assembly stages map to build statuses via `build-state.ts`:
- Multiple assembly sub-stages (`cable_management`, `bios`, `os_install`, `drivers`) → `"assembly"` status
- `release` stage → `"ready"` status
- The mapping is bidirectional

---

## 19. Purchasing

**Route:** `/purchasing` (list), `/purchasing/:poId` (detail)
**Capability:** `purchasing`
**Files:** `src/routes/_app.purchasing.index.tsx`, `src/routes/_app.purchasing.$poId.tsx`, `src/components/purchasing/new-po-dialog.tsx`

### What It Is

Purchase Order management for procuring inventory from suppliers.

### PO Lifecycle

```
Draft → Submitted → Confirmed → Partial → Received
                          ↓
                      Cancelled
```

### PO Statuses

| Status | Description |
|---|---|
| `draft` | Being created |
| `submitted` | Sent to supplier |
| `confirmed` | Supplier confirmed |
| `partial` | Partially received |
| `received` | Fully received |
| `cancelled` | Cancelled |

### Creating a PO (`createPurchaseOrder`)

Parameters:
- `supplierId` — which supplier
- `lines[]` — array of `{ productId, name, sku, qty, unitCost }`
- `expectedAt` — expected delivery date
- `notes` — optional notes

Auto-generates `PO-YYYY-<n>` ID with line totals.

### PO Detail

Shows:
- Supplier info
- Line items with expected qty, received-so-far, status
- Total cost
- Status-aware action buttons
- Timeline

---

## 20. Suppliers

**Route:** `/suppliers` (list), `/suppliers/:supplierId` (detail)
**Capability:** `suppliers`
**Files:** `src/routes/_app.suppliers.index.tsx`, `src/routes/_app.suppliers.$supplierId.tsx`, `src/components/suppliers/supplier-form-dialog.tsx`

### Supplier Fields

| Field | Description |
|---|---|
| `id` | Auto-generated `sup-<n>` |
| `name` | Company name |
| `contact` | Contact person |
| `email` | Email address |
| `phone` | Phone number |
| `address` | Physical address |
| `terms` | Payment terms (e.g., "Net 30") |
| `leadTime` | Average delivery lead time |
| `categories` | Product categories they supply |
| `rating` | 0-5 rating |
| `status` | `active` or `inactive` |

### Supplier CRUD

- **Create** (`createSupplier`): rating=0, status=active
- **Update** (`updateSupplier`): Patches any field

### Demo Suppliers

1. Nexlogic Distribution
2. Silicon Bay Trading
3. Pacific Components
4. Microsoft PH
5. Eastridge Peripherals (inactive)

---

## 21. Receiving / Goods Receipts

**Route:** `/receiving` (list), `/receiving/:receiptId` (detail)
**Capability:** `receiving`
**Files:** `src/routes/_app.receiving.index.tsx`, `src/routes/_app.receiving.$receiptId.tsx`

### What It Is

Manages the physical receiving of goods ordered via Purchase Orders. Tracks what was expected vs what actually arrived, including damaged units and serial number registration.

### Receipt Lifecycle

```
Created (from PO) → In Progress → Completed / Discrepancy
```

### Receipt Statuses

| Status | Description |
|---|---|
| `in_progress` | Currently being received |
| `completed` | All items received |
| `discrepancy` | Discrepancy between expected and received |

### Starting a Receipt (`startReceipt`)

- Takes a `purchaseOrderId`
- Creates (or returns existing) in-progress `GoodsReceipt`
- Generates `GR-<n>` ID
- Copies PO lines into receipt lines with `expected` quantities

### Receiving Workflow

1. Open a PO → Click "Receive"
2. For each line item:
   - Enter `received` quantity
   - Enter `damaged` quantity (if any)
   - Register serial numbers (for serial-tracked items)
3. Add notes
4. Click "Complete Receipt"

### Completing a Receipt (`completeReceipt`)

1. For each line:
   - Calls `onStock(productId, qty, ref)` callback → adds to main store's inventory
   - Calls `onSerials(productId, serials[], ref)` callback → registers serial numbers
2. Marks receipt as `completed` or `discrepancy` (if received ≠ expected)
3. Updates PO status:
   - If all lines fully received → PO status = `received`
   - If partial → PO status = `partial`

---

## 22. Customers

**Route:** `/customers` (list), `/customers/:customerId` (detail)
**Capability:** `customers`
**Files:** `src/routes/_app.customers.index.tsx`, `src/routes/_app.customers.$customerId.tsx`

### Customer Fields

| Field | Description |
|---|---|
| `id` | Auto-generated `c-<n>` |
| `name` | Full name |
| `email` | Email address |
| `phone` | Phone number |
| `address` | Physical address |
| `notes` | Free text notes |
| `since` | Registration date |
| `status` | `active` or `inactive` |

### Customer CRUD

- **Create** (`createCustomer`): Auto-generates ID, sets `active` status, logs audit

### Customer 360° Profile

```
┌──────────────────────────────────────────────┐
│  JUAN DELA CRUZ                               │
│  juan@email.com • 0917-123-4567              │
│  Member since Jan 15, 2026                    │
├──────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Total│ │Order│ │Build│ │Svc  │ │Warr.│   │
│  │Spent│ │s    │ │s    │ │     │ │     │   │
│  │₱182K│ │7    │ │2    │ │3    │ │5    │   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
├──────────────────────────────────────────────┤
│  Tabs:                                       │
│  [Orders] [Quotes] [Builds] [Services]       │
│  [Warranties] [Claims] [Timeline]            │
├──────────────────────────────────────────────┤
│  Purchase History                            │
│  DPC-10482  RTX 5070 Build    ₱98,500       │
│  DPC-10479  Maintenance       ₱1,500        │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### Cross-Linked Data

From a customer profile, you can navigate to:
- All orders
- All quotes
- All custom builds
- All service tickets
- All warranties
- All warranty claims
- Activity timeline

### Walk-in Customer

In the POS, if no customer is selected, the order is attributed to a "Walk-in Customer" (null customerId).

---

## 23. Services / Repair

**Route:** `/services` (list), `/services/:ticketId` (detail)
**Capability:** `services`
**Files:** `src/routes/_app.services.index.tsx`, `src/routes/_app.services.$ticketId.tsx`, `src/components/services/service-editor.tsx`

### What It Is

Service/repair ticket management for IT support, troubleshooting, maintenance, upgrades, and related services.

### Service Lifecycle

```
Received → Diagnosing → Waiting for Customer / Waiting for Parts →
In Repair → Ready → Released
                              ↓
                          Cancelled
```

### Service Statuses

| Status | Description |
|---|---|
| `received` | Device received, ticket created |
| `diagnosing` | Being diagnosed |
| `waiting_customer` | Waiting for customer decision/approval |
| `waiting_parts` | Waiting for parts to arrive |
| `in_repair` | Actively being repaired |
| `ready` | Repair complete, ready for pickup |
| `released` | Picked up by customer |
| `cancelled` | Ticket cancelled |

### Service Ticket Fields

| Field | Description |
|---|---|
| `id` | `SRV-<n>` |
| `customerId` | Customer who owns the device |
| `device` | Device description (e.g., "Custom PC", "Laptop") |
| `issue` | Reported issue |
| `diagnosis` | Technician's diagnosis |
| `technician` | Assigned technician |
| `status` | Current status |
| `estimatedCost` | Estimated repair cost |
| `actualCost` | Actual repair cost |
| `labor` | Labor charge |
| `parts` | Parts used (product references) |
| `notes` | Free text notes |
| `timeline` | Status change history |

### Service Parts

Parts can be added to a service ticket from inventory:
- **Add part** (`addServicePart`): Deducts from inventory, records as part of the ticket
- **Remove part** (`removeServicePart`): Restores inventory

Stock is checked before adding — cannot add more than available.

### Service Detail

```
┌──────────────────────────────────────────────┐
│  SERVICE #SRV-10482              [Status ▼]  │
│  Customer: Juan Dela Cruz                    │
│  Device: Custom PC                           │
│  Issue: Random shutdowns during gaming       │
├──────────────────────────────────────────────┤
│  Diagnosis: Failing PSU, insufficient wattage│
│  Technician: Mark Reyes                      │
│                                              │
│  Parts Used:                                 │
│  Corsair RM850e (PSU)     ₱6,500            │
│                                              │
│  Labor: ₱1,500                               │
│  Estimated: ₱8,000                           │
│  Actual: ₱8,000                              │
├──────────────────────────────────────────────┤
│  Timeline                                    │
│  ✓ Received         Sep 8, 10:00 AM          │
│  ✓ Diagnosing       Sep 8, 11:30 AM          │
│  ✓ In Repair        Sep 9, 09:00 AM          │
│  ✓ Ready            Sep 10, 02:00 PM         │
└──────────────────────────────────────────────┘
```

---

## 24. Warranty & Claims

**Route:** `/warranty` (list), `/warranty/:warrantyId` (detail), `/warranty/claims/:claimId` (detail)
**Capability:** `warranty`
**Files:** `src/routes/_app.warranty.index.tsx`, `src/routes/_app.warranty.$warrantyId.tsx`, `src/routes/_app.warranty.claims.$claimId.tsx`

### Warranty Auto-Creation

When a sale is completed via POS with serial-tracked items:
1. Each sold serial gets a `warrantyUntil` date (current date + product's `warrantyMonths`)
2. A `Warranty` record is auto-created linking: customer, product, serial, order, purchase date, expiration

### Warranty Statuses

| Status | Description |
|---|---|
| `active` | Warranty is valid |
| `expiring_soon` | Expiring within 30 days |
| `expired` | Past expiration date |

### Warranty Dashboard

Shows:
- Active warranties count
- Expiring soon count
- Expired count
- Open claims count

### Warranty Detail

```
┌──────────────────────────────────────────────┐
│  WARRANTY #WR-20452                          │
│  Status: Active                              │
├──────────────────────────────────────────────┤
│  Customer: Juan Dela Cruz                    │
│  Product: RTX 5070 Gaming OC                 │
│  Serial: SN-5070-92831                       │
│  Order: DPC-10482                            │
│  Purchase Date: Sep 11, 2026                 │
│  Warranty Until: Sep 11, 2027                │
├──────────────────────────────────────────────┤
│  Service History                             │
│  (linked service tickets)                    │
│                                              │
│  Claims                                      │
│  (linked warranty claims)                    │
└──────────────────────────────────────────────┘
```

### Warranty Claims

**Creating a Claim (`createClaim`):**
- Links to a warranty record
- Takes a `reason` string
- Sets status to `open`
- Generates `WC-<n>` ID

**Claim Statuses:**

| Status | Description |
|---|---|
| `open` | Claim filed |
| `in_review` | Being reviewed |
| `approved` | Claim approved |
| `rejected` | Claim denied |
| `closed` | Claim resolved |

**Updating a Claim (`updateClaim`):**
- Changes status
- Sets resolution and resolution note
- Appends timeline event
- Audit-logged

---

## 25. Releases / Handover

**Route:** `/releases` (list), `/releases/:releaseId` (detail)
**Capability:** `releases`
**Files:** `src/routes/_app.releases.index.tsx`, `src/routes/_app.releases.$releaseId.tsx`, `src/components/releases/new-release-dialog.tsx`

### What It Is

Manages the handover of completed builds, services, or orders to customers. Tracks scheduling, pickup/delivery, and completion.

### Release Lifecycle

```
Scheduled → Released → Completed
```

### Release Statuses

| Status | Description |
|---|---|
| `scheduled` | Pickup/delivery scheduled |
| `released` | Handed over to customer |
| `completed` | Fully completed |

### Release Kinds

| Kind | Source |
|---|---|
| `build` | Custom PC build |
| `service` | Completed service ticket |
| `order` | Standard order |

### Creating a Release (`createRelease`)

Parameters:
- `kind` — build/service/order
- `refId` — the source entity ID
- `scheduledAt` — when it's scheduled
- `receivedBy` — (at completion)
- `releasedBy` — staff who released
- `notes` — optional notes

Generates `REL-<n>` ID.

### Release Propagation (`completeReleaseSource`)

When a release is completed, it propagates back to the source entity:
- Build → status `released`
- Service → status `released`
- Order → status `completed`

This keeps all modules in sync.

---

## 26. Documents & Print

**Route:** `/documents`
**Capability:** `documents`
**Files:** `src/routes/_app.documents.tsx`, `src/components/nexus/document.tsx`

### What It Is

A document registry and preview system for generating printable business documents.

### Document Types (6)

| Kind | Description |
|---|---|
| `Sales Receipt` | POS sale receipt |
| `Invoice` | Formal invoice |
| `Quotation` | Price quotation |
| `Purchase Order` | PO to supplier |
| `Delivery / Release` | Delivery/release document |
| `Service Receipt` | Service/repair receipt |

### Document Structure

Each document has:
- **Header**: Company name, address, TIN, contact info
- **Reference**: Document number (DPC-xxxxx, QT-xxxxx, etc.)
- **Status**: Current status
- **Issued Date**: When it was created
- **Party**: Customer or supplier info (name, address, contact)
- **Lines**: Item table (description, SKU, qty, unit price)
- **Totals**: Subtotal, discount, tax, total
- **Footer**: "DEMO DOCUMENT — NOT A VALID BIR RECEIPT"

### Print Support

- `PrintButton` component triggers `window.print()`
- CSS `@media print` layout for clean printing
- Designed for future thermal printer integration

---

## 27. Reports & Analytics

**Route:** `/reports`
**Capability:** `reports`
**File:** `src/routes/_app.reports.tsx`

### Report Sections

| Report | Metrics |
|---|---|
| **Sales** | Revenue, order count, average order value |
| **Margin** | Gross profit, cost analysis (gated by `costs` capability) |
| **Inventory** | Total inventory value (retail + cost), low-stock items, dead stock |
| **Cashier Performance** | Sales per cashier, order count per cashier |
| **Service Output** | Service revenue, tickets completed |
| **Low Stock** | Products below reorder point |
| **Dead Stock** | Products with no sales movement |

### Report Filters

| Filter | Options |
|---|---|
| Time Range | Today, 7 Days, 30 Days, This Month, Custom Range |
| Category | Filter by product category |
| Product | Filter by specific product |
| Order Type | retail, service, custom_build |

### Export

- **CSV Export** (`exportCSV`): Downloads a CSV file named `dpc-nexus-{topic}-{date}.csv`
- **JSON Export** (`exportJSON`): Downloads a JSON file named `dpc-nexus-{topic}-{date}.json`
- Both use real `Blob` downloads

### Sales Chart

Same as dashboard: Recharts area chart with Today/7d/30d tabs.

---

## 28. Settings

**Route:** `/settings`
**Capability:** `settings`
**File:** `src/routes/_app.settings.tsx`

### Current Sections

| Section | Content |
|---|---|
| **Company Profile** | Preview of company info (name, address, TIN, phone, email) |
| **Theme** | Light/Dark mode toggle |
| **Sidebar** | Collapsed/Expanded preference |
| **Demo Data** | Reset demo data (main store), Reset ops data (ops store) |

> **Note:** The README spec calls for 10 sections (General, Store, Users, POS, Inventory, Notifications, Receipt, Tax, System, Demo Data). Currently only 4 sections are implemented.

### Reset Demo Data

Two separate reset buttons:
1. **Reset Demo Data** — Resets all main store data (products, orders, builds, etc.) to seed state
2. **Reset Ops Data** — Resets all ops store data (suppliers, POs, shifts, etc.) to seed state

Both preserve the current user session and sidebar state.

---

## 29. Audit Log

**Route:** `/audit`
**Capability:** `audit` (owner-only)
**File:** `src/routes/_app.audit.tsx`

### What It Is

A filterable, reverse-chronological trail of all significant actions in the system.

### Audit Entry Fields

| Field | Description |
|---|---|
| `id` | Auto-generated |
| `timestamp` | When the action occurred |
| `actor` | Who performed the action |
| `role` | Actor's role |
| `action` | What was done |
| `entity` | Which entity was affected |
| `entityId` | The entity's ID |
| `details` | Optional additional info |

### What Gets Logged

Every meaningful action writes an audit entry:
- Sales completed
- Stock adjustments
- Serial registrations
- Quote creation/status changes
- Build creation/status changes
- Service ticket creation/status changes
- Warranty claim updates
- Settings changes
- And more

### Filtering

- By actor
- By role
- By action type
- By entity type

### Stats

Shows total entries, entries today, unique actors.

---

## 30. Notifications

**Capability:** Built into the topbar
**File:** `src/components/app/app-topbar.tsx`

### Notification Fields

| Field | Description |
|---|---|
| `id` | Auto-generated |
| `kind` | Type of notification |
| `title` | Short title |
| `message` | Description |
| `priority` | `critical`, `high`, or `normal` |
| `read` | Boolean |
| `createdAt` | Timestamp |
| `entityType` | Related entity type |
| `entityId` | Related entity ID |

### Notification Kinds

| Kind | Trigger |
|---|---|
| `payment` | Sale completed |
| `quote` | Quote approved |
| `build` | Build status changed (especially `ready`) |
| `service` | Service ticket updated |
| `stock` | Low stock alert |

### Priority Levels

| Level | Usage |
|---|---|
| `critical` | QA test failed, out of stock |
| `high` | Quote approved, build ready |
| `normal` | General updates |

### Topbar Integration

- Bell icon with unread count badge
- Click to open notification popover
- Recent notifications listed
- "Mark all read" button
- Notifications are clickable → navigate to related entity

---

## 31. Data Architecture & Type System

### Core Types (`src/lib/types.ts`)

```
User
├── id, name, email, role, avatar

Category
├── id, name, key (stable semantic key)

Product
├── id, name, sku, brand, categoryId, type
├── price, cost, serialTracked, warrantyMonths
├── location, supplier, specs, archived

InventoryItem
├── productId, onHand, reserved, damaged, sold, reorderPoint

SerialNumber
├── id, serial, productId, status
├── orderId, buildId, customerId, warrantyUntil

InventoryMovement
├── id, productId, type, qty, ref, date, actor

Customer
├── id, name, email, phone, address, notes, since, status

Order
├── id, customerId, items[], payments[], status, type
├── subtotal, discount, tax, total
├── timeline[], notes, createdAt, cashierId

Quote
├── id, customerId, items[], status
├── subtotal, discount, serviceTotal, tax, total
├── expiresAt, linkedBuildId, notes, createdAt

Build
├── id, customerId, purpose, budget
├── components[], services[]
├── qaChecks[], status, notes
├── technician, qaStaff, qaSignedAt
├── linkedQuoteId, linkedOrderId

ServiceTicket
├── id, customerId, device, issue, diagnosis
├── technician, status, parts[], labor
├── estimatedCost, actualCost, notes, timeline[]

Warranty
├── id, customerId, productId, serialId
├── orderId, purchaseDate, warrantyUntil, status

WarrantyClaim
├── id, warrantyId, reason, status, resolution
├── resolutionNote, timeline[], createdAt

CartLine
├── productId, qty, unitPrice, serials[]

AuditLog
├── id, timestamp, actor, role, action, entity, entityId

AppNotification
├── id, kind, title, message, priority, read, createdAt
├── entityType, entityId
```

### Operations Types (`src/lib/ops-types.ts`)

```
Supplier
├── id, name, contact, email, phone, address
├── terms, leadTime, categories[], rating, status

PurchaseOrder
├── id, supplierId, lines[], status
├── totalCost, expectedAt, notes, createdAt

GoodsReceipt
├── id, purchaseOrderId, lines[], status, notes
├── createdAt, completedAt

ReturnRequest
├── id, orderId, productId, serialId, qty
├── reason, condition, refundMethod, status
├── resolution, resolutionNote, restockedAt, createdAt

Shift
├── id, openingCash, countedCash, cashier
├── status, adjustments[], tenders, refunds
├── variance, openedAt, closedAt, notes

BuildOps
├── buildId, technician, qaStaff
├── assemblySteps[], tests[], qaSignedAt

ReleaseRecord
├── id, kind, refId, status
├── scheduledAt, releasedAt, completedAt
├── releasedBy, receivedBy, notes
```

---

## 32. State Management & Persistence

### Provider Architecture

```
<StoreProvider>           ← Main store (products, orders, cart, etc.)
  <OpsProvider>           ← Operations store (suppliers, POs, shifts, etc.)
    <RouterProvider>      ← TanStack Router
      <TooltipProvider>   ← Radix tooltips
        <Toaster />       ← Sonner toast notifications
        {/* App routes */}
    </RouterProvider>
  </OpsProvider>
</StoreProvider>
```

### localStorage Keys

| Key | Store | Schema Version |
|---|---|---|
| `dpc-nexus-demo-v1` | Main | v1 |
| `dpc-nexus-ops-v1` | Operations | v1 |

### Persistence Behavior

1. **On mount**: Read from localStorage → hydrate state
2. **On every state change**: Write to localStorage (debounced)
3. **Schema versioning**: If version mismatches, discard snapshot and reseed
4. **Corrupt data**: Falls back to demo seed data
5. **Quota errors**: Silently swallowed (graceful degradation)
6. **Simulated latency**: `useSimulatedLoad(320ms)` provides fake loading states

### Cross-Store Communication

The **build-sync event bus** (`build-sync.ts`) bridges the two stores:

- `emitBuildStatus(buildId, stage)` — emits when assembly stage changes
- `onBuildStatus(callback)` — subscribes to stage changes
- The main store listens and updates build status accordingly

### Demo Data Reset

- `resetDemoData()` — resets main store to seed data
- `resetOpsData()` — resets ops store to seed data
- Both accessible from Settings page

---

## 33. Cross-Module Workflows

### Workflow 1: Standard POS Sale

```
1. Cashier opens POS (/pos)
2. Searches/browses products
3. Adds items to cart
4. Optionally selects serial numbers
5. Optionally attaches customer
6. Clicks Checkout
7. Payment dialog opens
8. Selects payment method (Cash/GCash/Bank/Card)
9. Enters payment details
10. Confirms payment
11. System:
    a. Creates order (DPC-xxxxx)
    b. Deducts inventory
    c. Marks serials as sold
    d. Creates warranties
    e. Generates notification
    f. Writes audit log
12. Success screen shown
13. Optional: Print receipt
```

### Workflow 2: Custom Build → Sale

```
1. Staff creates build (/builds → New Build)
2. Assigns customer, purpose, budget
3. Adds components by slot (CPU, GPU, etc.)
4. Compatibility engine checks in real-time
5. Build summary shows parts + services total
6. Staff generates quote from build (quoteFromBuild)
7. Quote created with 14-day expiry
8. Quote sent to customer
9. Customer approves
10. Staff converts quote to order (convertQuoteToOrder)
11. Inventory reserved for build components
12. Build enters assembly pipeline
13. Assembly kanban tracks progress
14. QA testing performed
15. Build marked ready
16. Release scheduled
17. Customer picks up
18. Release completed → build status = released
19. Warranty auto-created
```

### Workflow 3: Service/Repair

```
1. Customer brings in device
2. Staff creates service ticket (/services → New Ticket)
3. Enters device info, issue description
4. Ticket status: received → diagnosing
5. Technician diagnoses the issue
6. Parts needed? → waiting_parts
7. Customer approval needed? → waiting_customer
8. Parts arrive → in_repair
9. Parts assigned to ticket (deducted from inventory)
10. Repair completed → ready
11. Customer picks up → released
12. Release propagation: order status = completed
13. Warranty may be involved if claim
```

### Workflow 4: Purchasing & Receiving

```
1. Inventory staff identifies low stock
2. Creates purchase order (/purchasing → New PO)
3. Selects supplier, adds product lines
4. PO status: draft → submitted
5. Supplier confirms → confirmed
6. Goods arrive → start receipt
7. Staff receives items:
   - Enters received qty per line
   - Enters damaged qty
   - Registers serial numbers
8. Completes receipt
9. System:
   a. Adds to inventory (onHand)
   b. Registers serial numbers
   c. Updates PO status (partial/received)
10. PO status: received
```

### Workflow 5: Return / RMA

```
1. Customer returns a product
2. Staff creates return request (/returns → New Return)
3. Selects order, product, serial, reason
4. Return status: requested → inspection
5. Staff inspects item
6. If approved:
   a. Stock restored (one-time guard)
   b. Status: approved → refunded/replaced
   c. Returned movement recorded
7. If rejected:
   a. Status: rejected
   b. No stock change
```

### Workflow 6: Cash Drawer Management

```
1. Cashier starts shift (/shifts → Open Shift)
2. Enters opening cash float
3. System auto-closes any prior open shift
4. During shift:
   - All POS sales go through this shift
   - Cash adjustments can be made (cash_in/cash_out)
5. End of shift:
   a. Counts physical cash
   b. Enters payment method breakdown
   c. Enters refund total
   d. Closes shift
6. System calculates:
   - Expected cash (opening + cashSales + adjustments - refunds)
   - Variance (counted - expected)
```

---

## 34. Compatibility Engine

**File:** `src/lib/compatibility.ts`

### What It Does

Real-time compatibility checking for custom PC builds. Runs as components are added/removed.

### Rules

| Rule | Severity | Validation |
|---|---|---|
| **Socket mismatch** | ERROR | CPU socket must match motherboard socket |
| **Memory type mismatch** | ERROR | RAM DDR generation must match motherboard support |
| **PSU insufficient** | ERROR | Combined CPU+GPU TDP must not exceed PSU wattage |
| **PSU headroom tight** | WARNING | PSU headroom should be ≥ 20% of rated wattage |
| **Form factor mismatch** | ERROR | mITX case cannot fit ATX/mATX motherboards |
| **Tight form factor** | WARNING | ATX board in mATX case — verify clearance |
| **Missing CPU** | INFO | No CPU selected |
| **Missing Motherboard** | INFO | No motherboard selected |
| **Missing RAM** | INFO | No RAM selected |
| **Missing PSU** | INFO | No PSU selected |
| **Missing Case** | INFO | No case selected |
| **Missing Storage** | INFO | No storage selected |

### Severity Levels

| Level | Icon | Color | Meaning |
|---|---|---|---|
| `error` | ✕ | Red | Incompatible — must fix |
| `warning` | ⚠ | Amber | Potential issue — review |
| `info` | ℹ | Blue | Missing component — optional |

### How It Works

1. Takes the build's `components[]` array and the full `products[]` array
2. Resolves each component's specs (socket, memory type, TDP, form factor, wattage)
3. Runs all rules
4. Returns `CompatibilityIssue[]` with severity, title, detail, and affected slots
5. UI displays with semantic colors and slot highlighting

---

## 35. Demo Data Reference

### Main Store Seed Data

| Entity | Count | Examples |
|---|---|---|
| Users | 4 | Justine Ramos (owner), Mika Santos (admin), Paolo Cruz (cashier), Dana Lim (inventory) |
| Categories | 17 | CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooling, Fans, Monitor, Keyboard, Mouse, Headset, Networking, Accessories, Software, Services |
| Products | ~35 | AMD Ryzen 7 7800X3D, RTX 5070 Gaming OC, MSI B650M, Kingston Fury DDR5, Samsung 990 PRO, Corsair RM750e, + 5 services |
| Inventory | 30 | One row per non-service product |
| Serial Numbers | ~50+ | Generated per onHand unit + 3 pre-sold |
| Customers | 6 | Filipino names |
| Orders | 9 | DPC-10474 to DPC-10482 |
| Quotes | 6 | QT-10228 to QT-10245 |
| Builds | 6 | BUILD-10461 to BUILD-10482 |
| Services | 4 | SRV-10478 to SRV-10482 |
| Warranties | 6 | WR-20452 to WR-20481 |
| Warranty Claims | 2 | WC-3011, WC-3012 |
| Movements | 7 | Sample inventory movements |
| Audit Logs | 6 | Sample audit entries |
| Notifications | 5 | Sample notifications |
| Sales Series | 30 days | Daily revenue + order count |
| Hourly Series | 11 hours | 9AM–7PM revenue + order count |

### Ops Store Seed Data

| Entity | Count | Examples |
|---|---|---|
| Suppliers | 5 | Nexlogic Distribution, Silicon Bay Trading, Pacific Components, Microsoft PH, Eastridge Peripherals |
| Purchase Orders | 6 | PO-2026-00141 to 00146 (various statuses) |
| Goods Receipts | 2 | GR-00318 (completed), GR-00319 (discrepancy) |
| Return Requests | 3 | RMA-00213 to 00215 (various statuses) |
| Shifts | 3 | SH-00480 to 00482 (SH-00482 is open) |
| Build Ops | 4 | Assembly steps + test results for 4 builds |
| Releases | 3 | REL-00310 to 00312 |

### Company Profile

```
Name: Dream PC Build & IT Solutions
Short: DPC NEXUS
Address: 2F Unit 4, Aguinaldo Highway, Bacoor, Cavite
Phone: +63 917 555 0142
Email: sales@dreampcbuild.ph
TIN: 009-482-771-000
```

---

## 36. Known Limitations

### Not Implemented (Frontend-Only)

| Feature | Status | Why |
|---|---|---|
| Real authentication | Demo only | No backend — uses plaintext demo credentials |
| Real payments | Demo only | Payment dialog doesn't process real transactions |
| Real inventory sync | Demo only | localStorage only — no multi-device sync |
| Real printing | Preview only | CSS print layout exists but no printer integration |
| Barcode scanning | Not implemented | Specified in README but not built |
| Real-time sync | Not implemented | No WebSocket/SSE — single-user localStorage |
| Email/SMS notifications | Not implemented | Notifications are in-app only |
| Multi-location inventory | Not implemented | Single-location model |
| Barcode generation | Not implemented | No barcode/QR generation |
| BIR compliance | Not implemented | "NOT A VALID BIR RECEIPT" watermark present |

### Partially Implemented

| Feature | What Exists | What's Missing |
|---|---|---|
| Settings | 4 sections (Company, Theme, Sidebar, Demo Data) | README spec calls for 10 sections (General, Store, Users, POS, Inventory, Notifications, Receipt, Tax, System, Demo Data) |
| Keyboard shortcuts | F1 (POS), F2 (search), Ctrl+K (palette) | F3 (Customer), F4 (Hold), F5 (Checkout) not wired |
| Role switching | 4 roles with different permissions | No "Switch Demo Role" feature in UI |
| Technician role | Functionally covered by Inventory role | No dedicated `technician` role as specified in README |
| Consultation module | Referenced in business workflow | Module removed/deferred |

### Architecture Limitations

- **Single-user**: localStorage is browser-local — no multi-user/multi-device support
- **No data validation server-side**: All validation is frontend-only
- **No data encryption**: localStorage is plain text
- **No offline support**: No service worker or offline-first architecture
- **No data import/export** (except Reports CSV/JSON)
- **No multi-currency**: PHP only
- **No multi-language**: English only

---

## 37. Future Backend Integration

### Recommended Backend: Supabase

A full Supabase database architecture is documented at:
`docs/DPC-NEXUS-SUPABASE-DATABASE-ARCHITECTURE.md`

**33 tables, 31 RPCs, RLS model** — already designed.

### Integration Path

```
Current:
  UI → localStorage (demo)

Phase 1:
  UI → Supabase Client → Supabase DB
  (Replace store actions with Supabase calls)

Phase 2:
  UI → Supabase Client → Supabase DB
  + Edge Functions (business logic)
  + RLS (row-level security)
  + Auth (real authentication)

Phase 3:
  UI → Supabase → External integrations
  + WooCommerce sync
  + Payment gateway
  + Email/SMS
  + Printer integration
```

### What Needs to Change

| Current | Future |
|---|---|
| `store.tsx` localStorage reads/writes | Supabase queries/mutations |
| `ops-store.tsx` localStorage reads/writes | Supabase queries/mutations |
| `demo-data.ts` seed data | Database migrations + seed script |
| `permissions.ts` UI-level RBAC | Supabase RLS policies |
| `signInAs()` plaintext check | Supabase Auth (email/password, OAuth) |
| `useSimulatedLoad()` | Real loading states from API |

### Database Entities (from Supabase doc)

33 tables covering:
- users, roles, user_roles
- categories, products, inventory, inventory_movements, serial_numbers
- customers, orders, order_items, payments
- quotes, quote_items
- builds, build_components, build_services, qa_checks
- services, service_parts
- warranties, warranty_claims
- suppliers, purchase_orders, purchase_lines, goods_receipts, receipt_lines
- return_requests
- shifts, cash_adjustments
- releases
- audit_logs, notifications
- company_profile

---

## 38. WooCommerce / WordPress Integration Notes

### Can It Connect to WooCommerce?

**Yes, but it requires a significant integration layer.** The POS was designed to be backend-agnostic, so the architecture supports it.

### WooCommerce REST API Endpoints Needed

| POS Entity | WooCommerce Endpoint | Mapping |
|---|---|---|
| Product | `GET/POST/PUT /wp-json/wc/v3/products` | SKU, name, price, stock_quantity, categories |
| Category | `GET/POST /wp-json/wc/v3/products/categories` | name, slug |
| Customer | `GET/POST /wp-json/wc/v3/customers` | name, email, phone, address |
| Order | `GET/POST /wp-json/wc/v3/orders` | line_items, payment, status |
| Stock | `GET/PUT /wp-json/wc/v3/products/{id}` | stock_quantity, manage_stock |

### Integration Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  DPC Nexus  │────▶│  API Adapter     │────▶│  WooCommerce    │
│  POS UI     │     │  Layer           │     │  REST API       │
│             │     │  (new)           │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  Mapping Logic   │
                    │  POS SKU ↔ WC SKU│
                    │  Stock sync      │
                    │  Order mapping   │
                    └──────────────────┘
```

### Key Challenges

1. **SKU mapping**: Your POS uses custom SKU format (e.g., `CPU-AMD-7800X3D`). WooCommerce may use different SKUs.
2. **Stock model difference**: POS has onHand/reserved/available/damaged. WooCommerce has `stock_quantity` + `manage_stock`.
3. **Serial numbers**: WooCommerce doesn't natively support serial number tracking. Would need custom fields or a separate table.
4. **Custom builds**: WooCommerce doesn't have a "build" concept. Would need to map to variable products or custom order meta.
5. **Warranty**: WooCommerce doesn't track warranty per serial. Would need custom logic.
6. **Services/repair**: No WooCommerce equivalent. Would need a separate system.
7. **Purchasing/suppliers**: WooCommerce doesn't have PO management. Would need custom implementation.

### Recommended Approach

**Don't go direct POS → WooCommerce.** Instead:

1. Build the Supabase backend first (already architected)
2. Create a WooCommerce ↔ Supabase sync service
3. POS talks to Supabase (clean, fast, full-featured)
4. Supabase syncs product catalog and orders to WooCommerce
5. WooCommerce handles the e-commerce customer-facing side
6. POS handles the in-store operations

This gives you:
- Clean separation of concerns
- Full POS features without WooCommerce limitations
- E-commerce sync for online sales
- Single source of truth (Supabase)

---

*Documentation generated from codebase analysis. Last updated: September 2026.*
*DPC Nexus v0.1 — Frontend Demo Build*
