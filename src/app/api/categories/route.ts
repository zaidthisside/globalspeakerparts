import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ─── GET /api/categories ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('[GET /api/categories] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch product counts for each category (non-hidden products only)
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_hidden', false);

        return {
          ...category,
          product_count: countError ? 0 : (count ?? 0),
        };
      })
    );

    return NextResponse.json(categoriesWithCounts, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[GET /api/categories] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/categories ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Only include columns that exist in the categories table
    const insertPayload = {
      name: body.name,
      slug: body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: body.description ?? null,
      image_url: body.image_url ?? null,
      seo_meta: body.seo_meta ?? null,
      sort_order: body.sort_order ?? 0,
      is_hidden: body.is_hidden ?? false,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/categories] Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details, code: error.code },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Category was not created.' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[POST /api/categories] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
