-- =====================================================
-- Coffee Shop Management System — Database Setup Script
-- =====================================================
-- Run this script in PostgreSQL (pgAdmin or psql)
-- Step 1: Create the database (run this separately first)
-- Step 2: Connect to coffee_shop database, then run the rest
-- =====================================================

-- STEP 1: Run this line FIRST (in the default 'postgres' database)
-- CREATE DATABASE coffee_shop;

-- STEP 2: Connect to coffee_shop database, then run everything below
-- \c coffee_shop   (if using psql)
-- Or select 'coffee_shop' database in pgAdmin, then run below:

-- =====================================================
-- ENUMS
-- =====================================================

DO $$ BEGIN
  CREATE TYPE "ProductCategory" AS ENUM ('HOT', 'COLD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'CASH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Customers Table
CREATE TABLE IF NOT EXISTS "customers" (
    "id"         SERIAL PRIMARY KEY,
    "name"       VARCHAR(255) NOT NULL,
    "phone"      VARCHAR(20) UNIQUE NOT NULL,
    "email"      VARCHAR(255) UNIQUE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS "products" (
    "id"         SERIAL PRIMARY KEY,
    "name"       VARCHAR(255) NOT NULL,
    "category"   "ProductCategory" NOT NULL,
    "price"      DECIMAL(10,2) NOT NULL,
    "available"  BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS "orders" (
    "id"           SERIAL PRIMARY KEY,
    "txn_id"       VARCHAR(50) UNIQUE NOT NULL,
    "customer_id"  INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status"       "OrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS "order_items" (
    "id"         SERIAL PRIMARY KEY,
    "order_id"   INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity"    INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal"   DECIMAL(10,2) NOT NULL,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS "payments" (
    "id"       SERIAL PRIMARY KEY,
    "order_id" INTEGER UNIQUE NOT NULL,
    "method"   "PaymentMethod" NOT NULL,
    "status"   "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "paid_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================
-- INDEXES (for performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders"("customer_id");

-- =====================================================
-- DONE! Tables are ready.
-- Now run:  cd backend && npx prisma db pull && npm run db:seed
-- =====================================================

SELECT 'All tables created successfully!' AS status;
