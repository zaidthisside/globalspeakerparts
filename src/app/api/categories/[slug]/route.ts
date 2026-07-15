import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ─── GET /api/categories/[slug] ──────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, short_desc, featured_image, is_featured, sort_order')
      .eq('category_id', category.id)
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (productsError) {
      console.error('[GET /api/categories/[slug]] products error:', productsError);
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    return NextResponse.json({ ...category, products: products || [] }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[GET /api/categories/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PUT /api/categories/[slug] ──────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    // Sanitize — only send valid categories table columns
    const updatePayload: Record<string, unknown> = {};
    const categoryColumns = [
      'name', 'slug', 'description', 'image_url', 'seo_meta',
      'sort_order', 'is_hidden',
    ];
    for (const col of categoryColumns) {
      if (col in body) {
        updatePayload[col] = body[col];
      }
    }
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/categories/[slug]] Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details, code: error.code },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PUT /api/categories/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/categories/[slug] ───────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('[DELETE /api/categories/[slug]] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[DELETE /api/categories/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
