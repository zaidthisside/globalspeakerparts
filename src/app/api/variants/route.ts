import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, name, specs, stock, price, is_active, sort_order } = body;

    const { data, error } = await supabase
      .from('variants')
      .insert({
        product_id,
        name,
        specs,
        stock: stock ?? 0,
        price: price ?? 0,
        is_active: is_active ?? true,
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Variant id is required' }, { status: 400 });
    }

    // Delete associated part_numbers first
    await supabase
      .from('part_numbers')
      .delete()
      .eq('variant_id', id);

    // Delete the variant
    const { error } = await supabase
      .from('variants')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Variant deleted' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
