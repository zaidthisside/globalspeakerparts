import { NextResponse, NextRequest } from 'next/server';
import { supabase, isLocalFallbackEnabled } from '@/lib/supabaseClient';
import { localDb } from '@/lib/dbFallback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    if (isLocalFallbackEnabled()) {
      const fallbackProducts = localDb.products.list({
        categorySlug: categorySlug || undefined,
        search: search || undefined,
      }).map((product) => ({
        ...product,
        category_name: product.category_name || null,
        category_slug: product.category_slug || null,
        variants: [],
      }));
      return NextResponse.json(fallbackProducts, { status: 200 });
    }

    let query = supabase
      .from('products')
      .select('*, categories(name, slug), variants(*)')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // Filter by category slug
    if (categorySlug) {
      // First get category id from slug
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      } else {
        return NextResponse.json([], { status: 200 });
      }
    }

    // Search by name or short_desc
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_desc.ilike.%${search}%`);
    }

    // Filter featured only
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      const fallbackProducts = localDb.products.list({
        categorySlug: categorySlug || undefined,
        search: search || undefined,
      }).map((product) => ({
        ...product,
        category_name: product.category_name || null,
        category_slug: product.category_slug || null,
        variants: [],
      }));
      return NextResponse.json(fallbackProducts, { status: 200 });
    }

    // Reshape to flatten category info and include variants
    const products = (data || []).map((product) => {
      const { categories, category, ...rest } = product;
      const catObj = categories || category;
      return {
        ...rest,
        category_name: (catObj as Record<string, unknown>)?.name ?? null,
        category_slug: (catObj as Record<string, unknown>)?.slug ?? null,
      };
    });

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category_id,
      name,
      slug,
      short_desc,
      long_desc,
      featured_image,
      is_hidden,
      is_featured,
      seo_meta,
      tags,
      applications,
      sort_order,
    } = body;

    const insertedPayload = {
      category_id,
      name,
      slug,
      short_desc,
      long_desc,
      featured_image,
      is_hidden: is_hidden ?? false,
      is_featured: is_featured ?? false,
      seo_meta,
      tags,
      applications,
      sort_order: sort_order ?? 0,
    };

    if (isLocalFallbackEnabled()) {
      const fallbackProduct = localDb.products.insert(insertedPayload);
      return NextResponse.json({
        ...fallbackProduct,
        category_name: null,
        category_slug: null,
        variants: [],
      }, { status: 201 });
    }

    let createdProduct: Record<string, unknown> | null = null;
    let createError: Error | null = null;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(insertedPayload)
        .select()
        .single();

      createdProduct = data as Record<string, unknown> | null;
      if (error) {
        createError = new Error(error.message);
      }
    } catch (err) {
      createError = err instanceof Error ? err : new Error('Product creation failed');
    }

    if (!createdProduct || createError) {
      const fallbackProduct = localDb.products.insert(insertedPayload);
      createdProduct = {
        ...fallbackProduct,
        category_name: null,
        category_slug: null,
        variants: [],
      };
    }

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
