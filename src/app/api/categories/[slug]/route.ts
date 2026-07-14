import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_meta: any;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  featured_image: string | null;
  is_hidden: boolean;
};

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    // Fetch category
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, seo_meta")
      .eq("slug", slug)
      .single();

    if (catError || !catData) {
      console.error("Category fetch error:", catError);
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = catData as Category;

    // Fetch products belonging to the category
    const { data: prodData, error: prodError } = await supabase
      .from("products")
      .select("id, name, slug, short_desc, featured_image, is_hidden")
      .eq("category_id", category.id)
      .order("name", { ascending: true });

    if (prodError) {
      console.error("Products fetch error:", prodError);
    }

    const products = (prodData || []) as Product[];

    return NextResponse.json({ category, products }, { headers: { "Cache-Control": "s-maxage=300" } });
  } catch (e) {
    console.error("Unexpected error in category GET:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
