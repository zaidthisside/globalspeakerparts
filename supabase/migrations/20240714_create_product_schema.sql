-- supabase/migrations/20240714_create_product_schema.sql

-- 1. Categories table (top level)
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  seo_meta jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Products table (belongs to a category)
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  short_desc text,
  long_desc text,
  featured_image text,
  is_hidden boolean default false,
  is_featured boolean default false,
  seo_meta jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Variants table (belongs to a product)
create table if not exists variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  specs jsonb,
  stock integer,
  price numeric,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. Part numbers (many per variant)
create table if not exists part_numbers (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid references variants(id) on delete cascade,
  code text not null,
  created_at timestamp with time zone default now()
);

-- 5. Product images (gallery)
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt_text text,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- 6. Downloads (catalogues, datasheets)
create table if not exists downloads (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  type text not null, -- e.g., "catalog", "datasheet"
  url text not null,
  title text,
  created_at timestamp with time zone default now()
);

-- 7. FAQs
create table if not exists faqs (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  question text not null,
  answer text not null,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- 8. Related products (many‑to‑many)
create table if not exists related_products (
  product_id uuid references products(id) on delete cascade,
  related_product_id uuid references products(id) on delete cascade,
  primary key (product_id, related_product_id)
);

-- Indexes for fast lookup
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_variants_product on variants(product_id);
create index if not exists idx_part_numbers_variant on part_numbers(variant_id);
