# Dream Pc POS 

# DPC NEXUS — PREMIUM PC RETAIL POS & OPERATIONS PLATFORM

## Lovable Frontend Master Build Specification

You are not acting as a basic UI generator.

You are acting as a **senior product engineering team** responsible for designing and building the complete frontend of a production-quality POS and operations platform for a professional PC custom-build and IT solutions company.

The target company is **Dream PC Build & IT Solutions**.

The primary objective is to create a **high-end, professional, modern, dark-themed POS and operations interface specifically designed around a PC hardware retail, custom PC building, repair, service, warranty, inventory, and sales workflow.**

This is a **frontend-first project**.

The backend does NOT need to be fully implemented yet.

However, the frontend architecture, data structures, routes, components, states, and workflows must be designed so that a real backend can be integrated later without rebuilding the entire application.

---

# 1. YOUR ROLE

Act as a complete senior product team.

Do not approach this as a simple landing page or generic admin dashboard.

Simulate the responsibilities of:

### Senior Product Manager

Define a coherent product experience and prioritize the workflows that matter most to a PC retail/custom-build business.

### Senior UX Designer

Design workflows that minimize unnecessary clicks and make the system fast for actual store employees.

### Senior UI Designer

Create a premium, coherent, distinctive visual system.

### Senior Frontend Engineer

Build clean, reusable, scalable frontend architecture using the technologies available in Lovable.

### Senior Design Systems Engineer

Create reusable components, tokens, spacing rules, typography, states, and interaction patterns.

### Senior Motion Designer

Use animation strategically and professionally.

### Senior Interaction Designer

Design hover states, transitions, drawers, dialogs, command palettes, keyboard interactions, feedback states, and micro-interactions.

### Senior QA Engineer

Check the entire interface for broken states, inconsistent behavior, poor responsiveness, inaccessible controls, missing states, and unfinished screens.

### Senior Business Analyst

Think about the real operational workflow of a PC custom-build and IT solutions company rather than creating a generic retail POS.

### Senior Product Architect

Structure the frontend in a way that can later connect to Supabase or another backend/API.

---

# 2. MOST IMPORTANT INSTRUCTION

Do NOT create a generic SaaS admin dashboard.

Do NOT create a generic restaurant POS.

Do NOT create a generic inventory template.

Do NOT simply place:

* sidebar
* four statistic cards
* chart
* table

and consider the project complete.

The interface must feel purpose-built for a **professional PC hardware and IT solutions company**.

The product should communicate:

* precision
* engineering
* technology
* reliability
* professionalism
* speed
* premium hardware
* developer/technical culture

The design should feel like software that could realistically be used by a serious PC hardware company.

---

# 3. PRODUCT NAME

Use the working product name:

# DPC NEXUS

Subtitle:

**PC Retail & Operations Platform**

The branding should be subtle and professional.

Do not make the product look like a gaming RGB website.

This is an internal business application.

Think:

**Linear + Vercel + modern developer tools + premium enterprise software + PC hardware engineering console**

rather than:

**gaming RGB dashboard + generic Bootstrap admin panel.**

---

# 4. PRIMARY DESIGN DIRECTION

The entire application should use a **premium dark developer/engineering aesthetic**.

## Visual keywords

* Dark
* Minimal
* Technical
* Precise
* Premium
* Modern
* Professional
* Developer-oriented
* High-end
* Clean
* Dense but not cluttered
* Information-rich
* Operational

The application should look excellent in screenshots but should prioritize actual usability over visual effects.

---

# 5. COLOR SYSTEM

Use a near-black foundation.

Suggested visual direction:

Background:
#09090B

Surface:
#111113

Elevated surface:
#18181B

Border:
#27272A

Primary text:
#FAFAFA

Secondary text:
#A1A1AA

Muted text:
#71717A

Use accent colors sparingly.

Suggested semantic accents:

Success:
green

Information:
cyan/blue

Warning:
amber

Danger:
red

Do NOT overuse gradients.

Do NOT make the application colorful.

Do NOT make every card glow.

The interface should primarily be grayscale with subtle technical accents.

---

# 6. TYPOGRAPHY

Use a modern professional sans-serif font available in the environment.

Preferred visual direction:

**Inter / Geist-like typography**

Use a monospace font such as:

**JetBrains Mono / Geist Mono / equivalent**

for technical information such as:

* SKU
* Serial numbers
* Order IDs
* Build IDs
* transaction IDs
* stock codes
* system statuses
* technical specifications

Example:

DPC-10482

GPU-RTX5070

SN: 8C2A-91F4

These should feel like technical identifiers.

---

# 7. DESIGN PRINCIPLE

The interface should feel:

> "Built by engineers for people who work with computers."

Not:

> "A colorful dashboard template."

Use strong hierarchy, subtle borders, excellent spacing, compact but readable data presentation, and high-quality interaction patterns.

---

# 8. APPLICATION STRUCTURE

Create a complete application shell.

Primary navigation:

## OVERVIEW

* Dashboard

## SALES

* Point of Sale
* Orders
* Quotes

## INVENTORY

* Products
* Inventory
* Custom Builds

## CUSTOMERS

* Customers
* Services
* Warranty

## ANALYTICS

* Reports

## SYSTEM

* Settings

The sidebar should support collapsing.

When collapsed, show icons with tooltips.

When expanded, show icons + labels.

---

# 9. GLOBAL APPLICATION SHELL

Create a premium application shell containing:

### Sidebar

* DPC Nexus logo/wordmark
* navigation
* active route indicator
* collapsible behavior
* user profile at bottom
* settings
* subtle hover states

### Topbar

Include:

* page title
* breadcrumbs where appropriate
* global search
* command palette trigger
* notifications
* user avatar/profile menu

The topbar should remain visually lightweight.

Do not waste too much vertical space.

---

# 10. COMMAND PALETTE

Implement a global command palette.

Keyboard shortcut:

**Ctrl + K**

or the platform-appropriate equivalent.

It should allow users to quickly perform actions such as:

* New Sale
* New Quote
* New Customer
* Find Product
* Find Order
* Find Customer
* Open Inventory
* Open Builds
* Open Warranty
* Open Services
* Open Reports
* Go to Dashboard
* Open Settings

The command palette should feel similar to professional developer tools.

Use subtle animation.

---

# 11. DEMO LOGIN PAGE

Create a polished login experience.

The login page must feel like a premium internal enterprise application.

Do NOT make it look like a generic authentication template.

## Visual concept

Dark background.

Subtle technical visual language.

Possible elements:

* extremely subtle grid
* faint circuit-like geometry
* restrained ambient glow
* minimal animated technical background
* DPC Nexus branding
* small system/status text

Do not overdo it.

The page should remain professional.

Example branding:

DPC NEXUS

PC Retail & Operations Platform

---

## Login form

Fields:

Email

Password

Remember me

Sign In

Forgot password

Optional:

"Demo Environment"

---

# 12. DEMO AUTHENTICATION

Because this is frontend-first, implement a **demo authentication flow**.

I want to be able to immediately test the application.

The login should NOT require a real backend.

Use a clearly defined demo credential.

For example:

Email:
[demo@dpcnexus.local](mailto:demo@dpcnexus.local)

Password:
demo1234

The exact credentials can be shown subtly on the login page through a:

**"Use Demo Account"**

button.

Clicking that button should populate or directly authenticate the demo user.

After login, route to the dashboard.

The demo authentication should be clearly structured so that it can later be replaced with real authentication.

Do NOT pretend this is secure production authentication.

This is explicitly a frontend demonstration environment.

---

# 13. ROLE-BASED DEMO USERS

Prepare the frontend architecture for these roles:

### Owner

Full access.

### Admin

Most operational access.

### Cashier

Sales, customers, orders, quotes.

### Technician

Builds, services, QA.

### Inventory Staff

Products, inventory, stock movements.

For the demo, allow role simulation if practical.

For example:

Profile menu:

Demo User

Role:
Owner

Optional:

Switch Demo Role

This will allow testing of different UI permissions.

---

# 14. DASHBOARD

Create a premium operations dashboard.

Do not make it overly card-heavy.

The dashboard should answer:

* How is the business doing today?
* What needs attention?
* What is happening with orders?
* What inventory needs attention?
* What builds are currently active?
* What recent activity occurred?

---

## Dashboard header

Example:

Good afternoon

Thursday, August 13, 2026

[ Search ]

[ + New Sale ]

---

# 15. DASHBOARD KPI SECTION

Include:

### Today's Sales

₱128,450

### Orders

24

### Low Stock

17

### Open Builds

8

### Pending Quotes

12

Use supporting context such as:

* percentage change
* today's count
* comparison to previous period

Do not invent misleading analytics.

Clearly mark all data as demo data.

---

# 16. SALES ANALYTICS

Create a clean sales chart.

Allow switching between:

* Today
* 7 Days
* 30 Days

Show:

* revenue
* order count

The chart should be minimal and professional.

No excessive chart decoration.

---

# 17. INVENTORY ALERTS

Create an actionable inventory panel.

Example:

RTX 5070 Gaming OC
2 available

Ryzen 7 7800X3D
1 available

1TB NVMe SSD
3 available

Allow:

View Inventory

---

# 18. BUILD PIPELINE

Show current custom PC builds.

Example statuses:

Consultation

Quoted

Approved

Assembly

Testing

Ready

Released

Use a compact pipeline or operational list.

---

# 19. RECENT TRANSACTIONS

Display realistic demo transactions.

Examples:

DPC-10482
Ryzen 7 7800X3D Custom Build
₱98,500

DPC-10481
RTX 5070 Gaming OC
₱42,500

DPC-10480
Kingston Fury 32GB DDR5
₱4,250

DPC-10479
PC Maintenance Service
₱1,500

Use realistic PC hardware data throughout the application.

Do NOT use generic "Product 1", "Customer 1", etc.

---

# 20. POINT OF SALE

This is the most important module.

The POS must be designed specifically for computer hardware retail.

It should be optimized for speed.

---

# 21. POS LAYOUT

Create a professional two-panel layout.

Left:

Product discovery

Right:

Cart and checkout summary

The POS should work well at:

1366x768

1920x1080

and larger desktop displays.

---

# 22. PRODUCT CATEGORIES

Include categories:

* CPU
* GPU
* Motherboard
* RAM
* Storage
* PSU
* Case
* Cooling
* Fans
* Monitor
* Keyboard
* Mouse
* Headset
* Networking
* Accessories
* Software
* Services

Use technical icons where appropriate.

---

# 23. PRODUCT SEARCH

The POS search must be prominent.

Placeholder:

Search products, SKU, serial number...

Support demo search by:

* product name
* SKU
* serial number

Example:

Searching:

7800

returns:

AMD Ryzen 7 7800X3D

CPU

SKU: CPU-AMD-7800X3D

Stock: 4

₱21,500

---

# 24. PRODUCT CARD

Product cards should contain:

* product name
* category
* SKU
* price
* stock status
* optional thumbnail
* availability

Use compact technical presentation.

Avoid huge ecommerce-style product cards.

This is a POS.

Speed matters.

---

# 25. CART

Cart items should show:

Product

SKU

Quantity

Price

Stock availability

Optional serial selection for serial-tracked items.

Example:

RTX 5070 Gaming OC

SKU: GPU-RTX5070

Qty: 1

₱42,500

---

# 26. POS CART SUMMARY

Show:

Subtotal

Discount

VAT/Tax

Services

Total

Keep the total visually prominent.

---

# 27. CUSTOMER SELECTION

Before checkout, allow:

Walk-in Customer

or:

Search Customer

or:

* New Customer

Customer information should be reusable across the system.

---

# 28. CHECKOUT FLOW

Create a polished checkout flow.

Steps:

### 1. Cart

### 2. Customer

### 3. Payment

### 4. Confirmation

---

# 29. PAYMENT METHODS

Demo support:

* Cash
* GCash
* Bank Transfer
* Card

No real payment integration is required.

---

# 30. PAYMENT SUCCESS

After completing a demo sale:

Show a premium success state.

Example:

✓ Sale Completed

Order #DPC-10482

Total:

₱87,450

Then actions:

View Order

Print Receipt

New Sale

---

# 31. RECEIPT PREVIEW

Create a professional receipt preview.

Include:

* company branding
* order number
* customer
* items
* subtotal
* discount
* tax
* total
* payment method
* date/time

Frontend only.

Actual printing can be implemented later.

---

# 32. ORDERS

Create a complete orders module.

Order list should support:

* search
* filtering
* status
* date
* customer
* order type

Statuses:

* Pending
* Paid
* Processing
* Assembly
* Testing
* Ready
* Completed
* Cancelled
* Refunded

---

# 33. ORDER DETAIL

Create a detailed order page.

Include:

Order ID

Customer

Order date

Payment status

Order status

Items

Payment summary

Timeline

Notes

Serial numbers

Warranty information

For custom builds, show build information.

---

# 34. ORDER TIMELINE

Example:

Payment received

↓

Parts reserved

↓

Assembly started

↓

QA testing

↓

Build completed

↓

Ready for release

↓

Released

Make this visually clear.

---

# 35. CUSTOM BUILD MODULE

This is one of the most important differentiating features.

Create a dedicated Custom Build workspace.

A build should have:

Build ID

Customer

Budget

Purpose

Selected components

Compatibility status

Total price

Labor/services

Status

Notes

---

# 36. BUILD COMPONENTS

Support:

CPU

Motherboard

RAM

GPU

Storage

PSU

Case

Cooling

Fans

Operating System

Accessories

Services

Each component should show:

* product
* SKU
* price
* stock
* compatibility status

---

# 37. COMPATIBILITY CHECK UI

Frontend demo logic is enough for now.

Show:

✓ CPU socket compatible

✓ RAM generation compatible

✓ PSU capacity sufficient

✓ GPU selected

⚠ BIOS update may be required

✕ Component incompatible

Use clear semantic colors.

The interface should make compatibility feel like an engineering validation process.

---

# 38. BUILD SUMMARY

Show:

Parts total

Assembly

Cable management

OS installation

Testing

Other services

Grand total

Example:

Parts:
₱91,450

Assembly:
₱2,500

Windows installation:
₱1,000

Cable management:
₱500

Total:
₱95,450

---

# 39. BUILD STATUS

Support:

Draft

Consultation

Quoted

Approved

Parts Reserved

Assembly

Testing

Ready

Released

Cancelled

---

# 40. QUOTES

Create a professional quotation workflow.

Users should be able to:

Create quote

Select customer

Select components

Add services

Set expiration

Add notes

Preview quote

Save quote

Convert quote to sale

---

# 41. QUOTE STATUS

Use:

Draft

Sent

Pending

Approved

Rejected

Expired

Converted

---

# 42. CONVERT QUOTE TO SALE

This is a critical workflow.

A quote should have:

**Convert to Sale**

button.

When clicked:

Quote → Order

Do not make this just a decorative button.

Implement the demo state transition.

---

# 43. INVENTORY

Create a full inventory module.

Show:

Total products

Total units

Low stock

Out of stock

Reserved stock

Inventory value

---

# 44. INVENTORY TABLE

Include:

Product

SKU

Category

On Hand

Reserved

Available

Status

Price

Location

---

# 45. IMPORTANT INVENTORY CONCEPT

Do not represent inventory only as:

Quantity = 10

Use:

On Hand

Reserved

Available

Damaged

Sold

Example:

RTX 5070

On Hand: 5

Reserved: 2

Available: 3

---

# 46. PRODUCT DETAIL

Product detail should have tabs:

Overview

Inventory

Serial Numbers

Pricing

Suppliers

Warranty

History

---

# 47. SERIAL NUMBER MANAGEMENT

For high-value hardware, show serial numbers.

Example:

SN: 5070-92831

Status:
Sold

Customer:
Juan Dela Cruz

Order:
DPC-10482

Warranty:
Active until Aug 13, 2027

---

# 48. INVENTORY HISTORY

Show events such as:

Stock received

Stock reserved

Stock sold

Stock adjusted

Stock damaged

Stock returned

Use a timeline.

---

# 49. CUSTOMERS

Create customer management.

Customer list:

Name

Contact

Orders

Total spent

Last purchase

Status

---

# 50. CUSTOMER PROFILE

Create a 360-degree customer profile.

Example:

JUAN DELA CRUZ

Total Spent:
₱182,450

Orders:
7

Custom Builds:
2

Services:
3

Active Warranties:
5

Then show:

Purchase history

Build history

Service history

Warranty history

Quotes

Timeline

---

# 51. SERVICES

Create a service/repair module.

This is important because the company also provides IT support, troubleshooting, maintenance, upgrades, and related services.

Create service tickets.

Example:

SRV-10482

Customer:
Juan Dela Cruz

Device:
Custom PC

Issue:
Random shutdown

Status:
Diagnosing

---

# 52. SERVICE STATUSES

Use:

Received

Diagnosing

Waiting for Customer

Waiting for Parts

In Repair

Ready

Released

Cancelled

---

# 53. SERVICE DETAIL

Include:

Customer

Device

Issue

Diagnosis

Technician

Parts used

Labor

Estimated cost

Actual cost

Notes

Timeline

Status

---

# 54. WARRANTY

Create a Warranty Center.

Dashboard:

Active warranties

Expiring soon

Expired

Open claims

---

# 55. WARRANTY DETAIL

Show:

Customer

Product

Serial number

Order

Purchase date

Warranty expiration

Warranty status

Service history

Claim history

---

# 56. BUILD QA

Create a dedicated quality assurance interface for custom PC builds.

Example:

BUILD QA

DPC-10482

Hardware:

✓ CPU installed

✓ RAM detected

✓ GPU detected

✓ SSD detected

✓ BIOS configured

✓ Cable management complete

Testing:

✓ POST

✓ Memory test

✓ CPU stress test

✓ GPU stress test

✓ Storage health

✓ Temperature test

Final:

PASS BUILD

---

# 57. REPORTS

Create professional business reporting screens.

Include:

Revenue

Orders

Average Order Value

Gross Profit

Quote Conversion

Inventory Turnover

Service Revenue

Custom Build Revenue

Top Products

Best Categories

---

# 58. REPORT FILTERS

Allow:

Today

7 Days

30 Days

This Month

Custom Range

Category

Product

Order Type

---

# 59. SETTINGS

Create a professional settings interface.

Sections:

General

Store Information

Users & Roles

POS

Inventory

Notifications

Receipt

Tax

System

Demo Data

---

# 60. DEMO DATA

Populate the entire application with realistic demo data.

Do not use:

Product 1

Customer 1

Order 1

Instead use realistic data based on PC hardware.

Examples:

AMD Ryzen 7 7800X3D

AMD Ryzen 5 7600

RTX 5070

RTX 5060 Ti

MSI B650M

Kingston Fury Beast DDR5

Samsung 990 PRO

Corsair RM750e

etc.

Use realistic but clearly fictional customer/order information.

Do not expose real private customer data.

---

# 61. DATA ARCHITECTURE

Even though this is frontend-only, structure the application around clear data entities.

Prepare TypeScript interfaces/types or equivalent structures for:

Product

InventoryItem

SerialNumber

Customer

Order

OrderItem

Quote

QuoteItem

Build

BuildComponent

Payment

Warranty

WarrantyClaim

ServiceTicket

ServicePart

User

Role

AuditLog

---

# 62. FRONTEND-FIRST ARCHITECTURE

Do not hardwire all data directly inside random page components.

Separate:

UI

Mock data

Types

Business logic

Reusable components

Where appropriate, create a mock service/API layer.

The goal is:

Current:

Frontend
↓
Mock API / demo data

Future:

Frontend
↓
Real API / Supabase
↓
Database

The UI should not need to be completely rewritten when the backend is introduced.

---

# 63. STATE MANAGEMENT

Use an appropriate state-management solution available in the Lovable environment.

The following state concepts should be considered:

* authentication/demo session
* cart
* selected customer
* selected products
* active build
* quote state
* filters
* UI preferences
* sidebar state

Do not over-engineer unnecessarily.

---

# 64. RESPONSIVE DESIGN

Primary target:

Desktop POS environment.

Must work well at:

1366x768

1440x900

1920x1080

2560x1440

Also provide good tablet behavior.

Mobile should provide usable owner/manager views.

Do not simply shrink the desktop interface.

Use responsive layouts intentionally.

---

# 65. ACCESSIBILITY

Apply professional accessibility practices.

Include:

* keyboard navigation
* visible focus states
* semantic controls
* appropriate contrast
* accessible labels
* tooltips where icons are ambiguous
* usable dialogs
* proper form validation
* screen-reader-friendly semantics where practical

---

# 66. ANIMATION DIRECTION

Use the animation libraries available in the Lovable environment.

If Framer Motion is available, use it where appropriate.

If GSAP is available and useful, use it for more advanced motion.

Do not add animation just because animation is possible.

Use motion for:

* page transitions
* sidebar expansion
* modal/drawer transitions
* command palette
* cart updates
* success states
* number counters
* status changes
* subtle hover interactions
* build pipeline transitions

Animation should generally be:

fast

subtle

functional

premium

---

# 67. MOTION RULE

The POS must always feel fast.

Avoid:

* long transitions
* excessive bouncing
* giant animations
* unnecessary parallax
* excessive blur
* excessive glowing
* distracting background animations

The user should feel:

**"This software is fast."**

not:

**"This software is showing me animations."**

---

# 68. MICRO-INTERACTIONS

Pay special attention to:

Buttons

Inputs

Dropdowns

Tables

Status badges

Cart items

Search results

Tabs

Sidebar

Notifications

Success states

Errors

Loading states

Hover states

Focus states

These small details are what will make the product feel premium.

---

# 69. LOADING STATES

Every major data-driven screen must have a loading state.

Use polished skeleton loaders.

Do not leave blank white/dark spaces.

---

# 70. EMPTY STATES

Every list must have a meaningful empty state.

Example:

No open service tickets.

There are currently no active service tickets.

[ Create Service Ticket ]

---

# 71. ERROR STATES

Create professional error states.

Example:

Something went wrong.

We couldn't load inventory data.

[ Try Again ]

---

# 72. SUCCESS FEEDBACK

Use tasteful toast notifications and success states.

Examples:

Product added to cart.

Quote created.

Quote converted to order.

Inventory updated.

Sale completed.

Warranty claim created.

---

# 73. TABLE UX

Tables should support:

* sorting
* filtering
* search
* pagination where appropriate
* row hover
* clickable rows
* status badges
* compact density
* responsive handling

Do not make tables excessively tall.

This is an operational application.

---

# 74. SEARCH EXPERIENCE

Consider a global search.

The user should eventually be able to search:

Product

SKU

Serial number

Customer

Order

Quote

Build

Service ticket

Warranty

The UI should communicate the category of each result.

---

# 75. KEYBOARD-FIRST POS

Implement useful keyboard interactions where practical.

Examples:

F1 = New Sale

F2 = Product Search

F3 = Customer

F4 = Hold Sale

F5 = Checkout

ESC = Close dialog

Ctrl + K = Command Palette

Do not implement shortcuts that conflict with browser/system behavior.

---

# 76. RECEIPT / PRINT UI

Create a receipt preview component.

Actual printer integration is NOT required.

Prepare the UI so that future browser printing or thermal printer integration can be added.

---

# 77. BUSINESS WORKFLOW

The most important end-to-end workflow should be:

Customer

↓

Consultation

↓

Custom Build

↓

Compatibility Check

↓

Quote

↓

Customer Approval

↓

Sale

↓

Inventory Reservation

↓

Assembly

↓

QA Testing

↓

Ready for Release

↓

Customer Pickup/Release

↓

Warranty / Service

This workflow should be visible throughout the product.

---

# 78. DESIGN SYSTEM

Create reusable design tokens and components.

Do not individually style every page from scratch.

Build a coherent system around:

Buttons

Inputs

Cards

Tables

Badges

Dialogs

Drawers

Tabs

Command palette

Dropdowns

Toasts

Status indicators

Timelines

Stat blocks

Product cards

Order cards

Build cards

---

# 79. ICONOGRAPHY

Use a consistent professional icon set such as Lucide if available.

Avoid random emoji as interface icons.

Icons should be subtle and functional.

---

# 80. NO GENERIC EMOJI UI

Do not use:

🔥

💻

🚀

💰

etc.

as dashboard icons.

The product should look professional.

---

# 81. VISUAL HIERARCHY

Prioritize:

1. Primary action
2. Current status
3. Important information
4. Secondary information
5. Metadata

Do not make everything equally visually loud.

---

# 82. DENSITY

This is a business application.

Use a slightly denser information layout than a marketing website.

But maintain enough spacing for readability.

The interface should feel:

**information-dense, not cluttered.**

---

# 83. NO EXCESSIVE GLASSMORPHISM

Avoid turning every component into a glass card.

Use:

* flat dark surfaces
* subtle borders
* restrained elevation
* occasional translucent overlays

Premium does not mean everything is glass.

---

# 84. NO EXCESSIVE GRADIENTS

Gradients can be used for subtle branding/ambient effects.

They should never dominate the UI.

---

# 85. NO STOCK DASHBOARD LOOK

Avoid the common:

"Welcome back"

4 huge colorful cards

large pie chart

random line chart

table

This product needs a distinct identity.

---

# 86. INFORMATION ARCHITECTURE

The user should always know:

Where am I?

What am I looking at?

What can I do?

What changed?

What needs attention?

What is the next action?

---

# 87. MODALS VS FULL PAGES

Use dialogs/drawers for quick operations.

Use full pages for complex workflows.

Examples:

Quick product edit:
Dialog/Drawer

Create customer:
Dialog/Drawer

Custom PC Build:
Full page/workspace

Order detail:
Full page

Service ticket:
Full page

Checkout:
Focused flow

---

# 88. DEMO FUNCTIONALITY

Even without a backend, the application should feel interactive.

Implement frontend state changes for:

* adding products to cart
* changing quantities
* removing cart items
* selecting customers
* creating demo quotes
* changing quote status
* converting quote to sale
* changing order status
* creating a build
* selecting components
* calculating build totals
* showing compatibility states
* creating service tickets
* updating service status
* viewing warranty information
* filtering inventory
* searching products
* opening command palette
* demo login/logout

Persist important demo state locally where practical.

---

# 89. PRICE CALCULATIONS

Where appropriate, use actual frontend calculations for:

Subtotal

Discount

Tax

Services

Total

Build total

Quote total

Do not hardcode the displayed total after the user changes quantities.

---

# 90. INVENTORY DEMO BEHAVIOR

When a product is added to a cart:

Available stock should visually update in the demo state.

When a sale is completed:

Demo inventory can decrease.

This is frontend simulation only.

Clearly keep the data layer replaceable later.

---

# 91. ORDER DEMO BEHAVIOR

When a sale is completed:

Create a demo order.

Give it an order number.

Show it in Orders.

Show it in the dashboard recent transactions.

This will make the frontend feel like a real application instead of static mockups.

---

# 92. QUOTE DEMO BEHAVIOR

Create quote.

Save quote.

Change status.

Approve quote.

Convert quote to sale.

After conversion, the order should appear in Orders.

---

# 93. BUILD DEMO BEHAVIOR

Create build.

Select components.

Calculate price.

Show compatibility.

Save build.

Generate quote.

Change build status.

Move to assembly/testing.

Complete QA.

Mark ready.

---

# 94. ROLE-BASED UI

The frontend should have a permission-aware architecture.

For example:

Cashier should not see:

Financial cost information

Inventory adjustment controls

System administration

Technician should see:

Builds

Service

QA

but not necessarily:

financial reporting

Owner sees everything.

This can initially be demo logic.

---

# 95. SECURITY NOTE

Do not falsely represent frontend role restrictions as real security.

Because there is no backend yet, permissions are UI-level demonstration only.

When backend is introduced, real authorization must be enforced server-side.

---

# 96. PERFORMANCE

Keep the application performant.

Avoid:

* huge unnecessary dependencies
* excessive animations
* unnecessary rerenders
* massive images
* overcomplicated components

Use lazy loading/code splitting where appropriate.

---

# 97. CODE QUALITY

Write clean, maintainable frontend code.

Prefer:

Reusable components

Clear naming

Small focused components

Typed data

Centralized mock data

Reusable utilities

Consistent styling

Do not duplicate large chunks of JSX unnecessarily.

---

# 98. COMPONENT ARCHITECTURE

Create reusable components such as:

AppShell

Sidebar

Topbar

CommandPalette

PageHeader

StatCard

DataTable

StatusBadge

ProductCard

ProductSearch

CartItem

CartSummary

CustomerSelector

PaymentMethodSelector

OrderTimeline

BuildComponentCard

CompatibilityCheck

BuildSummary

QuoteStatus

ServiceTimeline

WarrantyCard

EmptyState

ErrorState

LoadingSkeleton

ConfirmDialog

Toast system

---

# 99. DEMO BRANDING

Use the name:

DPC NEXUS

Logo should be simple.

Avoid a complicated gaming logo.

Possible direction:

Minimal "DPC" monogram + technical mark.

It should work in:

Sidebar

Login

Favicon

Receipt

Loading screen

---

# 100. LOGIN BRAND EXPERIENCE

The login page should establish the design language immediately.

Possible small technical text:

SYSTEM STATUS
OPERATIONAL

VERSION
DEMO 0.1

ENVIRONMENT
DEMO

Keep these subtle.

---

# 101. DASHBOARD BRAND EXPERIENCE

The dashboard should feel like an operational command center.

Use subtle technical metadata where useful:

LAST SYNC

08:42:13

INVENTORY STATUS

OPERATIONAL

Do not fake real-time synchronization.

If it is demo data, label it appropriately.

---

# 102. NOTIFICATION SYSTEM

Create notification UI for:

Low stock

Quote approved

Build ready

Warranty expiring

Service ticket updated

Payment completed

Use priority levels.

---

# 103. AUDIT LOG

Create an activity/audit timeline UI.

Examples:

Justine created quote QT-10482.

Admin changed inventory quantity.

Cashier completed order DPC-10482.

Technician marked build QA as passed.

Inventory staff received stock.

This is demo data for now.

---

# 104. SETTINGS DESIGN

Settings should not be a generic form dump.

Use a left-side settings navigation with sections and clean forms.

Example:

General

Store

POS

Inventory

Users

Notifications

Receipt

System

---

# 105. FRONTEND DEMO ENVIRONMENT INDICATOR

Because this is not connected to a real backend yet, make it obvious in a tasteful way.

For example:

**DEMO MODE**

in the application shell.

Do not repeatedly display giant warnings.

---

# 106. FINAL VISUAL QUALITY BAR

Before considering the frontend complete, evaluate it against this question:

> "Would a professional PC retail/custom-build company actually be comfortable showing this internally?"

If the answer is no, continue improving it.

Do not stop at "technically complete."

---

# 107. SELF-REVIEW BEFORE FINISHING

Before finalizing, review the entire application as:

### Product Manager

Does the workflow solve a real business problem?

### UX Designer

Can a cashier use the POS quickly?

### UI Designer

Is the visual system consistent?

### Frontend Engineer

Is the code architecture maintainable?

### Motion Designer

Are animations useful rather than distracting?

### QA Engineer

Are loading, empty, error, success, and edge states covered?

### Business Analyst

Does the system actually fit a PC custom-build company?

---

# 108. DO NOT STOP AFTER THE FIRST FEW PAGES

Build the frontend as a coherent product.

The minimum expected complete frontend should include:

* Login
* Dashboard
* POS
* Orders
* Order Detail
* Quotes
* Quote Detail
* Customers
* Customer Detail
* Products
* Product Detail
* Inventory
* Custom Builds
* Build Detail
* Services
* Service Detail
* Warranty
* Reports
* Settings

All screens should feel like the same product.

---

# 109. PRIORITY ORDER

If you need to prioritize implementation, use this order:

## P0 — Critical

Login

App Shell

Dashboard

POS

Products

Inventory

Orders

Customers

Custom Builds

Quotes

## P1 — Important

Services

Warranty

Build QA

Reports

Settings

## P2 — Advanced

Advanced analytics

Full role management

Audit logs

Advanced barcode workflows

Real printer integration

Real payment integration

Real-time backend synchronization

---

# 110. IMPORTANT: DO NOT INVENT BACKEND FUNCTIONALITY

Because this is frontend-first:

Do not pretend that:

* real payments work
* real inventory synchronization works
* real authentication works
* real printers work
* real barcode scanners work
* real warranty databases exist

Instead, simulate these appropriately using frontend/demo state.

---

# 111. FUTURE BACKEND PREPARATION

Design the frontend so it can later connect to:

Supabase

or another REST/GraphQL API.

Potential future backend entities:

users

roles

products

inventory

inventory_movements

serial_numbers

customers

orders

order_items

quotes

quote_items

builds

build_components

payments

services

service_parts

warranties

warranty_claims

audit_logs

notifications

---

# 112. IMPORTANT FUTURE DATABASE CONSIDERATION

A physical PC component should eventually be traceable.

For example:

Product:
RTX 5070 Gaming OC

Physical Unit:
Serial #SN-92831

↓

Purchased

↓

Reserved

↓

Installed in Build DPC-10482

↓

Sold to Juan Dela Cruz

↓

Warranty active

↓

Potential service claim

The frontend should reflect this concept.

---

# 113. PRODUCT DETAILS

Products should distinguish between:

Product model

and

Physical inventory unit.

For example:

Product:

RTX 5070 Gaming OC

Stock:

5 units

Serial Numbers:

SN-001

SN-002

SN-003

SN-004

SN-005

This is important for future backend architecture.

---

# 114. CUSTOM BUILD TRACEABILITY

A completed build should eventually contain:

Build ID

Customer

Order

Components

Serial numbers

Technician

QA result

Date completed

Warranty information

Service history

The frontend should visually support this.

---

# 115. RECEIPT AND DOCUMENT PREVIEWS

Create UI previews for:

Receipt

Quote

Build Summary

Warranty Information

Service Ticket

These can initially be static/demo generated.

---

# 116. PRINTABLE DESIGN

Where practical, make document previews suitable for future printing.

Especially:

Receipt

Quotation

Build report

Service report

---

# 117. USER EXPERIENCE PRINCIPLE

The system should minimize unnecessary navigation.

For example:

From a customer:

Customer → Order → Build → Serial Number → Warranty

should be easy.

From a product:

Product → Inventory → Serial Number → Order → Customer

should also be easy.

Think of the application as a connected graph of business information.

---

# 118. CROSS-LINKING

Where appropriate, make identifiers clickable.

Example:

Order:
DPC-10482

Customer:
Juan Dela Cruz

Build:
BUILD-10482

Service:
SRV-10482

Serial:
SN-92831

Users should be able to navigate between related entities.

---

# 119. DETAIL PAGES

Every major entity should have a strong detail page.

Do not rely entirely on modal windows.

For complex objects, use:

Header

Status

Primary actions

Summary

Tabs

Timeline

Related records

---

# 120. PAGE HEADERS

Every page should clearly communicate:

Page title

Short description

Relevant status

Primary action

Optional secondary actions

Example:

CUSTOM BUILDS

Manage active and completed PC builds.

[ + New Build ]

---

# 121. ACTION HIERARCHY

Every page should have one obvious primary action.

Examples:

Dashboard:
New Sale

POS:
Checkout

Inventory:
Add Product

Builds:
New Build

Quotes:
New Quote

Services:
New Service Ticket

Do not make 10 buttons equally prominent.

---

# 122. FINAL PRODUCT FEEL

When navigating the app, the user should feel:

"Everything is connected."

"Everything has a purpose."

"This was designed specifically for a PC business."

"It feels fast."

"It feels premium."

"It feels like professional internal software."

---

# 123. IMPORTANT IMPLEMENTATION RULE

Use the **actual supported technology stack available in Lovable**.

Do not force technologies that are unavailable or incompatible with the environment.

Adapt the architecture to Lovable's capabilities while preserving the product requirements and design intent.

Use the best supported alternatives when necessary.

---

# 124. IF A FEATURE CANNOT BE FULLY IMPLEMENTED

This is extremely important.

Do NOT silently skip features.

Do NOT pretend something is implemented when it is not.

Do NOT create a fake button and consider the feature complete.

Instead, create the best possible frontend representation and document the limitation.

---

# 125. FINAL COMPLETION REPORT — REQUIRED

After building the frontend, provide a detailed implementation report.

The report MUST contain:

## A. IMPLEMENTED

List every major feature that was successfully implemented.

Example:

* Login
* Demo authentication
* Dashboard
* POS
* Cart
* Checkout
* Orders
* Inventory
* etc.

For each feature, briefly explain what works.

---

## B. PARTIALLY IMPLEMENTED

List features that exist visually but have limited functionality.

For each:

* What was implemented
* What is missing
* Why it is limited

---

## C. NOT IMPLEMENTED

Explicitly list anything that could not be built.

Do not hide omissions.

For every missing feature, explain:

1. Feature name
2. Why it was not implemented
3. What is needed
4. Whether backend integration is required
5. Recommended next step

---

## D. MOCK / DEMO FUNCTIONALITY

Clearly identify everything currently using mock data.

For example:

Authentication

Inventory

Orders

Payments

Analytics

Warranty

Service tickets

Explain where mock/demo state is being used.

---

## E. BACKEND REQUIREMENTS

Provide a detailed list of what the future backend must provide.

Include:

Authentication

Database

API

Authorization

Inventory synchronization

Serial number management

Payments

Orders

Quotes

Builds

Warranty

Services

Audit logs

Notifications

---

## F. RECOMMENDED DATABASE ENTITIES

Provide the recommended future database tables/entities.

Include important relationships.

---

## G. INTEGRATION CHECKLIST

Explain exactly what would need to happen to connect the frontend to a real backend.

---

## H. TECHNICAL DEBT

List any shortcuts taken for the demo.

---

## I. NEXT DEVELOPMENT PRIORITIES

Rank the next steps:

P0

P1

P2

Explain why each is important.

---

# 126. FINAL QUALITY REQUIREMENT

Do not tell me:

"Everything is complete"

unless it actually is.

I want an honest technical report.

If you encounter a limitation, clearly say:

**NOT IMPLEMENTED**

or

**DEMO ONLY**

and explain exactly what is required.

---

# 127. FINAL INSTRUCTION

Build this as if you are a senior product engineering team delivering the first polished prototype of a real product.

Do not optimize for simply generating many screens.

Optimize for:

**coherence**

**usability**

**speed**

**visual quality**

**technical credibility**

**real-world workflow**

**future backend integration**

**maintainability**

The finished frontend should feel like a serious product rather than an AI-generated template.

The visual identity should be:

# DARK

# TECHNICAL

# MINIMAL

# PREMIUM

# PROFESSIONAL

# DEVELOPER-INSPIRED

And the central product idea should remain:

> **DPC Nexus is the operational command center for a PC custom-build and IT solutions business.**

Start by establishing the design system and application shell, then implement the core workflows in priority order.

Do not sacrifice usability for visual effects.

Do not sacrifice architecture for speed.

Do not sacrifice completeness for a pretty first screen.

Build the product as a coherent system.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ef49fe4-ec2d-463b-824e-47814a01edac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
