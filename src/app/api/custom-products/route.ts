import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface ProductItem {
  id?: string;
  name: string;
  category: string;
  desc: string;
  materials: string;
  dimensions: string;
  tempLimit: string;
  frequencyRange: string;
  tolerances: string;
  startingPrice: string;
  moq: string;
  variants: string;
  imageKey: string;
  mediaUrls?: string;
  mediaList?: string[];
  compliance?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("custom_products")
      .select("data")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase SELECT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products = data ? data.map((row: { data: unknown }) => row.data as ProductItem) : [];
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("GET custom products error:", error);
    return NextResponse.json({ error: "Failed to read custom products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();

    if (product.action === "delete") {
      const { error } = await supabase
        .from("custom_products")
        .delete()
        .eq("id", product.id);

      if (error) {
        console.error("Supabase DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Upsert the custom product (uses product.id as primary key)
      const { error } = await supabase
        .from("custom_products")
        .upsert({
          id: product.id,
          data: product
        });

      if (error) {
        console.error("Supabase UPSERT error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Fetch and return the updated products list to keep client in sync
    const { data: selectData, error: selectError } = await supabase
      .from("custom_products")
      .select("data")
      .order("created_at", { ascending: false });

    if (selectError) {
      console.error("Supabase select after write error:", selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    const products = selectData ? selectData.map((row: { data: unknown }) => row.data as ProductItem) : [];
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("POST custom products error:", error);
    return NextResponse.json({ error: "Failed to write custom products" }, { status: 500 });
  }
}
