import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description,
        image_url,
        seo_meta,
        sort_order: sort_order ?? 0,
        is_hidden: is_hidden ?? false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
