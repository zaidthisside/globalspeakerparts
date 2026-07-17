import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ─── GET /api/products/[slug] ────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(slug, name)')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('[GET /api/products/[slug]] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants with part_numbers
    const { data: variants } = await supabase
      .from('variants')
      .select('*, part_numbers(*)')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true });

    // Fetch images
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

    // Fetch FAQs
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

    const { categories, ...productData } = product as Record<string, unknown> & {
      categories: { name: string; slug: string } | null;
    };

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
    console.error('[GET /api/products/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PUT /api/products/[slug] ────────────────────────────────────────────────
// Only update columns that exist in the products table.
// price and technical_specs are updated on the first/default variant.
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    // Build sanitized payload — only valid products table columns
    const productPayload: Record<string, unknown> = {};
    const productColumns = [
      'category_id', 'name', 'slug', 'short_desc', 'long_desc',
      'featured_image', 'is_hidden', 'is_featured', 'seo_meta',
      'tags', 'applications', 'sort_order', 'moq',
    ];
    for (const col of productColumns) {
      if (col in body) {
        productPayload[col] = body[col];
      }
    }
    productPayload.updated_at = new Date().toISOString();

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(productPayload)
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) {
      console.error('[PUT /api/products/[slug]] Supabase error:', updateError);
      return NextResponse.json(
        { error: updateError.message, details: updateError.details, code: updateError.code },
        { status: 500 }
      );
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If price or technical_specs were submitted, update the first variant
    const hasVariantData = 'price' in body || 'technical_specs' in body;
    if (hasVariantData) {
      const { data: existingVariants } = await supabase
        .from('variants')
        .select('id')
        .eq('product_id', updatedProduct.id)
        .order('sort_order', { ascending: true })
        .limit(1);

      const variantUpdate: Record<string, unknown> = {};
      if ('price' in body) variantUpdate.price = body.price ?? null;
      if ('technical_specs' in body) variantUpdate.specs = body.technical_specs ?? {};

      if (existingVariants && existingVariants.length > 0) {
        // Update existing variant
        await supabase
          .from('variants')
          .update(variantUpdate)
          .eq('id', existingVariants[0].id);
      } else {
        // No variant exists — create one
        await supabase.from('variants').insert({
          product_id: updatedProduct.id,
          name: 'Standard',
          specs: variantUpdate.specs ?? {},
          price: variantUpdate.price ?? null,
          is_active: true,
          sort_order: 0,
        });
      }
    }

    // Update product gallery images if provided
    if ('gallery' in body && Array.isArray(body.gallery)) {
      // Delete existing gallery images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', updatedProduct.id);

      // Insert new gallery images
      if (body.gallery.length > 0) {
        const imagesPayload = body.gallery.map((url: string, index: number) => ({
          product_id: updatedProduct.id,
          url,
          alt_text: '',
          order_index: index
        }));
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesPayload);
        if (imagesError) {
          console.warn('[PUT /api/products/[slug]] Gallery images insert warning:', imagesError.message);
        }
      }
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PUT /api/products/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/products/[slug] ─────────────────────────────────────────────
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
      console.error('[DELETE /api/products/[slug]] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[DELETE /api/products/[slug]] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
