import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ─── GET /api/products ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const includeHidden =
      searchParams.get('includeHidden') === 'true' ||
      searchParams.get('includeHidden') === '1';

    let query = supabase
      .from('products')
      .select('*, categories(name, slug), variants(*), product_images(*)')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeHidden) {
      query = query.eq('is_hidden', false);
    }

    if (categorySlug) {
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (catError || !category) {
        return NextResponse.json([], { status: 200 });
      }

      query = query.eq('category_id', category.id);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,short_desc.ilike.%${search}%`);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/products] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten category relation fields
    const products = (data || []).map((product) => {
      const { categories, ...rest } = product as Record<string, unknown> & {
        categories: { name: string; slug: string } | null;
      };
      return {
        ...rest,
        category_name: categories?.name ?? null,
        category_slug: categories?.slug ?? null,
      };
    });

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[GET /api/products] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/products ──────────────────────────────────────────────────────
// The products table only stores: category_id, name, slug, short_desc,
// long_desc, featured_image, is_hidden, is_featured, seo_meta, tags,
// applications, sort_order.
//
// Price and technical_specs belong to the variants table. We create a default
// variant automatically so the product is usable right away.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Only include columns that actually exist in the products table
    const productPayload = {
      category_id: body.category_id ?? null,
      name: body.name,
      slug: body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      short_desc: body.short_desc ?? null,
      long_desc: body.long_desc ?? null,
      featured_image: body.featured_image ?? null,
      is_hidden: body.is_hidden ?? false,
      is_featured: body.is_featured ?? false,
      seo_meta: body.seo_meta ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      applications: body.applications ?? null,
      moq: body.moq ?? null,
      sort_order: body.sort_order ?? 0,
    };

    // Insert the product
    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (productError) {
      console.error('[POST /api/products] Supabase product insert error:', productError);
      return NextResponse.json(
        { error: productError.message, details: productError.details, code: productError.code },
        { status: 500 }
      );
    }

    if (!createdProduct) {
      return NextResponse.json({ error: 'Product was not created.' }, { status: 500 });
    }

    // Create a default variant using price and technical_specs from the form
    const variantPayload = {
      product_id: createdProduct.id,
      name: 'Standard',
      specs: body.technical_specs && typeof body.technical_specs === 'object'
        ? body.technical_specs
        : {},
      price: body.price ? parseFloat(String(body.price)) : null,
      stock: null,
      is_active: true,
      sort_order: 0,
    };

    const { error: variantError } = await supabase
      .from('variants')
      .insert(variantPayload);

    if (variantError) {
      // Variant creation failure is non-fatal — product exists, log and continue
      console.warn('[POST /api/products] Variant insert warning:', variantError.message);
    }

    // Create product gallery images if provided
    if (Array.isArray(body.gallery) && body.gallery.length > 0) {
      const imagesPayload = body.gallery.map((url: string, index: number) => ({
        product_id: createdProduct.id,
        url,
        alt_text: '',
        order_index: index
      }));
      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesPayload);
      if (imagesError) {
        console.warn('[POST /api/products] Gallery images insert warning:', imagesError.message);
      }
    }

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[POST /api/products] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
