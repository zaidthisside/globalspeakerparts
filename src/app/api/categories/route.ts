import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
  };
};

// GET /api/categories – list all visible categories
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, seo_meta")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase categories GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Category[], { headers: { "Cache-Control": "s-maxage=300" } });
  } catch (e) {
    console.error("GET categories unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
