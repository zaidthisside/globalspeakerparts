# Product Catalog Architecture Redesign

## Goal
Replace the current flat‑product + modal system with a scalable **Category → Product → Variant** architecture that supports thousands of items, is SEO‑friendly, and fully editable via the admin panel.

## What will change
- **Database schema** – normalized tables: `categories`, `products`, `variants`, `part_numbers`, `product_images`, `downloads`, `faqs`, `related_products`.
- **API layer** – new RESTful endpoints under `/api/categories`, `/api/products/[slug]`, `/api/search`, and admin routes under `/api/admin/...` for CRUD operations.
- **Routing** – dynamic nested routes: `/<categorySlug>/` (category page) and `/<categorySlug>/<productSlug>/` (product detail page) with static, SEO‑friendly URLs.
- **Front‑end** – remove modal usage, wrap product cards in Next.js `<Link>` to product pages, create a new product detail page that renders hero, variants, specs, gallery, FAQs, downloads, sticky CTAs, etc.
- **Admin panel** – full CMS for categories and products (create, edit, delete, hide, sort, SEO fields, images, variants, part numbers, downloads, FAQs).
- **Search & filters** – server‑side search endpoint and UI filters for size, material, power, construction, application, availability.
- **SEO** – meta tags, OpenGraph, JSON‑LD product & breadcrumb schema per page.

## Migration plan
1. **Discovery** – map existing flat product fields to the new normalized model.
2. **Supabase migrations** – add the new tables, indexes on `slug`.
3. **Data migration script** – one‑off Node script to copy existing products into categories, products, variants, part numbers, images.
4. **API implementation** – create route handlers for the new tables.
5. **Front‑end refactor** – update category page, product card, add product detail page, remove modal.
6. **Admin UI extension** – add category & product management UI linked to new admin API.
7. **SEO & testing** – verify meta tags, schema, Lighthouse scores.
8. **Cut‑over** – switch navigation, add redirects from old `/product?id=` URLs, deprecate old table.
9. **Monitoring** – health check, logs, performance metrics.

## Open Questions (need user clarification)
- **Category image requirements** – should each category have a featured image/banner? If yes, add `image_url` field.
- **Variant spec structure** – do you want a fixed set of spec fields (size, material, power, etc.) or a flexible JSON blob? I suggest a JSON column `specs` for flexibility, but we can add explicit columns for the most common specs.
- **Permission model for admin API** – currently the site uses Supabase auth; should we rely on RLS policies or a simple token check?
- **Upload/storage for images & downloads** – continue using Supabase storage as before? Any bucket names you prefer?
- **Existing product URLs** – do you need permanent 301 redirects from `/product?id=…` to the new SEO URLs?

## Proposed file changes (high‑level)
- **Database migration** – new SQL file under `supabase/migrations/` (or run via Supabase dashboard).
- **API** – `src/app/api/categories/[slug]/route.ts`, `src/app/api/products/[slug]/route.ts`, `src/app/api/search/route.ts`, admin routes under `src/app/api/admin/...`.
- **Pages** – `src/app/[categorySlug]/page.tsx` (category listing), `src/app/[categorySlug]/[productSlug]/page.tsx` (product detail).
- **Components** – update `ProductCard.tsx` to use `<Link>`, add `VariantSelector.tsx`, `ProductHero.tsx`, `ProductSpecs.tsx`, `ProductGallery.tsx`, `StickyCTA.tsx`.
- **Admin UI** – extend `src/app/admin/page.tsx` with tabs/forms for Category and Product management.
- **Remove** – `src/components/ProductModal.tsx` and associated modal state in category page.
- **SEO utilities** – new `src/lib/seo.ts` for meta tag generation and schema creation.

---
**Verification plan**
- Run unit tests for API endpoints (if any exist). 
- Manual QA: navigate categories, open a product page, verify SEO meta tags via view‑source. 
- Confirm admin forms persist data correctly.

**User review required** – please confirm the open questions and approve the plan so I can start implementing the schema and API.
