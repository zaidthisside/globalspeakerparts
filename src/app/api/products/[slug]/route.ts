import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  long_desc: string | null;
  featured_image: string | null;
  is_hidden: boolean;
  is_featured: boolean;
  seo_meta: any;
  created_at: string;
  updated_at: string;
};

type Variant = {
  id: string;
  product_id: string;
  name: string;
  specs: any;
  stock: number | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PartNumber = {
  id: string;
  variant_id: string;
  code: string;
  created_at: string;
};

type Image = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  order_index: number;
};

type Download = {
  id: string;
  product_id: string;
  type: string;
  url: string;
  title: string | null;
};

type FAQ = {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  order_index: number;
};

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    // 1️⃣ Fetch the product itself
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*, category:categories!inner(slug, name)")
      .eq("slug", slug)
      .single();

    if (productError || !productData) {
      console.error("Product not found error:", productError);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productData as Product & { category: { slug: string; name: string } };

    // 2️⃣ Variants
    const { data: variantsData, error: variantsError } = await supabase
      .from("variants")
      .select("*, part_numbers!inner(*)")
      .eq("product_id", product.id);

    if (variantsError) {
      console.error("Variants fetch error:", variantsError);
    }

    const variants = (variantsData || []) as (Variant & { part_numbers: PartNumber[] })[];

    // 3️⃣ Images (gallery)
    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("url, alt_text, order_index")
      .eq("product_id", product.id)
      .order("order_index", { ascending: true });
    if (imagesError) console.error("Images fetch error:", imagesError);
    const images = (imagesData || []) as Image[];

    // 4️⃣ Downloads
    const { data: downloadsData, error: downloadsError } = await supabase
      .from("downloads")
      .select("type, url, title")
      .eq("product_id", product.id);
    if (downloadsError) console.error("Downloads fetch error:", downloadsError);
    const downloads = (downloadsData || []) as Download[];

    // 5️⃣ FAQs
    const { data: faqsData, error: faqsError } = await supabase
      .from("faqs")
      .select("question, answer, order_index")
      .eq("product_id", product.id)
      .order("order_index", { ascending: true });
    if (faqsError) console.error("FAQs fetch error:", faqsError);
    const faqs = (faqsData || []) as FAQ[];

    // 6️⃣ Related products (simple list of slugs & names)
    const { data: relatedData, error: relatedError } = await supabase
      .from("related_products")
      .select("related_product_id")
      .eq("product_id", product.id);
    let relatedProducts: { slug: string; name: string }[] = [];
    if (!relatedError && relatedData && relatedData.length > 0) {
      const relatedIds = relatedData.map((r: any) => r.related_product_id);
      const { data: relProds, error: relProdsErr } = await supabase
        .from("products")
        .select("slug, name")
        .in("id", relatedIds);
      if (!relProdsErr && relProds) relatedProducts = relProds as any;
    }

    const payload = {
      product,
      variants,
      images,
      downloads,
      faqs,
      relatedProducts,
    };

    return NextResponse.json(payload, { headers: { "Cache-Control": "s-maxage=300" } });
  } catch (e) {
    console.error("Unexpected error in product GET:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
