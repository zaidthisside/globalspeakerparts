import { NextResponse, NextRequest } from 'next/server';
import { supabase, isLocalFallbackEnabled } from '@/lib/supabaseClient';
import { localDb } from '@/lib/dbFallback';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image_url, seo_meta, sort_order, is_hidden } = body;

    const insertedPayload = {
      name,
      slug,
      description,
      image_url,
      seo_meta,
      sort_order: sort_order ?? 0,
      is_hidden: is_hidden ?? false,
    };

    if (isLocalFallbackEnabled()) {
      const fallbackCategory = localDb.categories.insert(insertedPayload);
      return NextResponse.json(fallbackCategory, { status: 201 });
    }

    let createdCategory: Record<string, unknown> | null = null;
    let createError: Error | null = null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(insertedPayload)
        .select()
        .single();

      createdCategory = data as Record<string, unknown> | null;
      if (error) {
        createError = new Error(error.message);
      }
    } catch (err) {
      createError = err instanceof Error ? err : new Error('Category creation failed');
    }

    if (!createdCategory || createError) {
      const fallbackCategory = localDb.categories.insert(insertedPayload);
      createdCategory = fallbackCategory as Record<string, unknown>;
    }

    return NextResponse.json(createdCategory, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
