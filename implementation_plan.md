# Coffee Shop Order Management System — Implementation Plan

## Overview

Build a full-stack Coffee Shop Order Management System with a professional admin dashboard (Starbucks-style). The system manages orders, customers, products, and provides real-time KPIs and analytics.

**Tech Stack:** React (Vite) + Tailwind CSS + Recharts | Node.js + Express + Prisma ORM | PostgreSQL

---

## Proposed Changes

### 1. Backend — Database & Prisma Schema

#### [NEW] `backend/prisma/schema.prisma`

Five normalized tables with proper relationships and indexes:

| Table | Key Fields |
|-------|-----------|
| **Customer** | id, name, phone, email, createdAt |
| **Product** | id, name, category (HOT/COLD), price, available, createdAt |
| **Order** | id, txnId (unique), customerId (FK), totalAmount, status, createdAt |
| **OrderItem** | id, orderId (FK), productId (FK), quantity, unitPrice, subtotal |
| **Payment** | id, orderId (FK, unique), method (CARD/UPI/CASH), status, paidAt |

- Indexes on `txnId`, `createdAt`, `customerId`
- Cascade deletes on OrderItems and Payment when Order is deleted

#### [NEW] `backend/prisma/seed.js`

Seed script with:
- 10 sample customers
- 12 coffee products (Latte, Cappuccino, Espresso, Mocha, etc. in HOT/COLD categories)
- 30+ sample orders with items and payments spanning the last 30 days

---

### 2. Backend — Express API Server

#### [NEW] `backend/package.json`

Dependencies: express, @prisma/client, cors, dotenv, helmet, morgan, express-validator

#### [NEW] `backend/.env`

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coffee_shop"
PORT=5000
```

#### [NEW] `backend/src/app.js`

Express app setup with CORS, helmet, morgan, JSON parsing, error handler middleware.

#### [NEW] `backend/src/server.js`

Server entry point — listen on PORT from env.

---

#### [NEW] `backend/src/middleware/errorHandler.js`

Global error handling middleware with structured JSON error responses.

#### [NEW] `backend/src/middleware/validate.js`

Validation middleware using express-validator.

---

#### Backend Routes & Controllers

| Route | File | Endpoints |
|-------|------|-----------|
| `/api/dashboard` | `dashboard.controller.js` | `GET /` — returns all KPIs, recent orders, daily sales chart data |
| `/api/orders` | `orders.controller.js` | `GET /` (search, filter, paginate, sort), `GET /:id`, `POST /` |
| `/api/customers` | `customers.controller.js` | `GET /`, `POST /` |
| `/api/products` | `products.controller.js` | `GET /`, `POST /` |

**Dashboard KPI Logic (Prisma queries):**
- Total Sales → `aggregate({ _sum: { totalAmount } })`
- Total Orders → `count()`
- Today's Sales → filter `createdAt >= startOfDay`
- Top Product → group by productId on OrderItem, order by `_sum.quantity` desc
- Payment Distribution → group by method on Payment
- Recent Orders → `findMany({ take: 5, orderBy: { createdAt: 'desc' } })`
- Daily Sales Chart → raw SQL grouping by date for last 30 days

**Order Creation Logic:**
1. Validate customer exists
2. Validate all products exist and are available
3. Generate unique TXN ID (e.g., `TXN-1714567890123`)
4. Calculate line item subtotals and order total
5. Create Order, OrderItems, and Payment in a single Prisma transaction

Each route has a corresponding:
- `backend/src/routes/<resource>.routes.js`
- `backend/src/controllers/<resource>.controller.js`
- `backend/src/services/<resource>.service.js`

---

### 3. Frontend — React (Vite) + Tailwind CSS

#### [NEW] `frontend/` — Vite React App

Created via `npx create-vite@latest ./ --template react`

#### Key Frontend Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Layout with sidebar + main content area, React Router |
| `src/index.css` | Tailwind directives + custom design tokens |
| `tailwind.config.js` | Custom color palette, fonts (Inter) |
| `src/services/api.js` | Axios instance with base URL config |
| `src/pages/Dashboard.jsx` | KPI cards, recent orders table, sales chart (Recharts) |
| `src/pages/Orders.jsx` | Orders table with search, date filter, pagination, sorting + create order modal |
| `src/pages/Customers.jsx` | Customer list + add customer form |
| `src/pages/Products.jsx` | Products list + add product form |
| `src/components/Sidebar.jsx` | Navigation sidebar with icons |
| `src/components/KPICard.jsx` | Reusable stat card component |
| `src/components/Badge.jsx` | Category/payment method badge |
| `src/components/DataTable.jsx` | Reusable sortable table component |
| `src/components/Modal.jsx` | Reusable modal for create forms |
| `src/components/SalesChart.jsx` | Recharts area chart for daily revenue |
| `src/components/Pagination.jsx` | Page navigation component |

**UI Design Direction:**
- Dark sidebar with coffee-themed accent colors (warm browns, amber, cream)
- Clean white content area with subtle shadows
- Glassmorphism effect on KPI cards
- Smooth hover transitions and micro-animations
- Google Font: Inter
- Responsive grid layout
- Professional badge styling for categories (HOT=warm red, COLD=cool blue) and payment methods

---

## Folder Structure

```
d:\Coffee_Shop_Management_System\
├── backend/
│   ├── .env
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── validate.js
│       ├── routes/
│       │   ├── dashboard.routes.js
│       │   ├── orders.routes.js
│       │   ├── customers.routes.js
│       │   └── products.routes.js
│       ├── controllers/
│       │   ├── dashboard.controller.js
│       │   ├── orders.controller.js
│       │   ├── customers.controller.js
│       │   └── products.controller.js
│       └── services/
│           ├── dashboard.service.js
│           ├── orders.service.js
│           ├── customers.service.js
│           └── products.service.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── KPICard.jsx
│       │   ├── Badge.jsx
│       │   ├── DataTable.jsx
│       │   ├── Modal.jsx
│       │   ├── SalesChart.jsx
│       │   └── Pagination.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Orders.jsx
│           ├── Customers.jsx
│           └── Products.jsx
└── README.md
```

---

## User Review Required

> [!IMPORTANT]
> **PostgreSQL Connection**: The plan assumes PostgreSQL is running locally on port 5432 with user `postgres` and password `postgres`, and a database named `coffee_shop`. Please confirm or provide your actual credentials.

> [!IMPORTANT]
> **Tailwind CSS Version**: You requested Tailwind CSS. The plan uses **Tailwind CSS v4** (latest, installed via `@tailwindcss/vite`). Please confirm this is acceptable, or if you prefer v3.

> [!NOTE]
> **Bonus features** (JWT auth, role-based access, CSV export, Docker) are deferred to a follow-up phase to keep the initial delivery focused and functional end-to-end.

---

## Open Questions

1. **PostgreSQL credentials** — What are your local PostgreSQL username, password, and port? (Default assumed: `postgres:postgres@localhost:5432`)
2. **Database name** — Should we use `coffee_shop` as the database name, or do you prefer something else?

---

## Verification Plan

### Automated Tests
- Run `npx prisma db push` to validate schema
- Run `npx prisma db seed` to populate test data
- Test all API endpoints via browser/curl
- Start frontend dev server and verify all pages render

### Manual Verification
- Open dashboard and verify KPI cards show correct data
- Create a new order and confirm it appears in the orders list and updates dashboard KPIs
- Test search, filter, pagination, and sorting on orders page
- Test customer and product CRUD
- Verify responsive design at various screen sizes
