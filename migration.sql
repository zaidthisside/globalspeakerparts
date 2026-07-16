-- Complete SQL Migration Script for Global Speaker Parts
-- Run this entire script in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

-- ─── 1. Create Categories Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_hidden BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  seo_meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. Create Products Table ─────────────────────────────────────────────────
-- NOTE: price and technical_specs are NOT here — they belong to the variants table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_desc TEXT,
  long_desc TEXT,
  featured_image TEXT,
  is_hidden BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  seo_meta JSONB,
  tags TEXT[] DEFAULT '{}',
  applications TEXT,
  moq TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure moq column exists in products table for existing databases
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq TEXT;

-- ─── 3. Create Variants Table ─────────────────────────────────────────────────
-- price and specs (technical_specs) live here
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock INTEGER,
  price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. Create Part Numbers Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS part_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. Create Product Images Gallery Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. Create Downloads Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. Create FAQs Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. Create Related Products Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS related_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, related_product_id)
);

-- ─── 9. Enable RLS and Add Permissive Policies ────────────────────────────────
-- IMPORTANT: Run these even if you ran the CREATE TABLE block above.
-- Without these policies, Supabase blocks ALL reads and writes via the anon key.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running to avoid duplicate errors
DROP POLICY IF EXISTS "Allow all" ON categories;
DROP POLICY IF EXISTS "Allow all" ON products;
DROP POLICY IF EXISTS "Allow all" ON variants;
DROP POLICY IF EXISTS "Allow all" ON part_numbers;
DROP POLICY IF EXISTS "Allow all" ON product_images;
DROP POLICY IF EXISTS "Allow all" ON downloads;
DROP POLICY IF EXISTS "Allow all" ON faqs;
DROP POLICY IF EXISTS "Allow all" ON related_products;

-- Create permissive policies (public B2B catalog, no auth required)
CREATE POLICY "Allow all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON part_numbers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON downloads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON related_products FOR ALL USING (true) WITH CHECK (true);
