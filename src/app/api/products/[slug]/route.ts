import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Fetch product with category info
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(slug, name)')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants with part_numbers, ordered by sort_order
    const { data: variants } = await supabase
      .from('variants')
      .select('*, part_numbers(*)')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true });

    // Fetch images ordered by order_index
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('order_index', { ascending: true });

    // Fetch downloads
    const { data: downloads } = await supabase
      .from('downloads')
      .select('*')
      .eq('product_id', product.id);

    // Fetch FAQs ordered by order_index
    const { data: faqs } = await supabase
      .from('faqs')
      .select('*')
      .eq('product_id', product.id)
      .order('order_index', { ascending: true });

    // Fetch related products
    const { data: relatedLinks } = await supabase
      .from('related_products')
      .select('related_product_id')
      .eq('product_id', product.id);

    let relatedProducts: Record<string, unknown>[] = [];
    if (relatedLinks && relatedLinks.length > 0) {
      const relatedIds = relatedLinks.map((r) => r.related_product_id);
      const { data: related } = await supabase
        .from('products')
        .select('slug, name, featured_image, short_desc')
        .in('id', relatedIds);
      relatedProducts = related || [];
    }

    // Reshape category info
    const { categories, ...productData } = product;

    return NextResponse.json(
      {
        ...productData,
        category: categories ?? null,
        variants: variants || [],
        images: images || [],
        downloads: downloads || [],
        faqs: faqs || [],
        related_products: relatedProducts,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
