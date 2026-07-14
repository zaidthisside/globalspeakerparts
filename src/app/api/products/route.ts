import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)')
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Reshape to flatten category info
    const products = (data || []).map((product) => {
      const { categories, ...rest } = product;
      return {
        ...rest,
        category_name: (categories as Record<string, unknown>)?.name ?? null,
        category_slug: (categories as Record<string, unknown>)?.slug ?? null,
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

    const { data, error } = await supabase
      .from('products')
      .insert({
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
