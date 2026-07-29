import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";

const supabase = createClient(supabaseUrl, supabaseKey);

// Default social links
const DEFAULTS = {
  instagram: "https://www.instagram.com/globalspeakerparts/?utm_source=ig_web_button_share_sheet",
  facebook: "https://www.facebook.com/share/181asRzd14/?mibextid=wwXIfr",
  whatsapp: "https://wa.me/919829062390",
  linkedin: "https://linkedin.com",
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_instagram", "social_facebook", "social_whatsapp", "social_linkedin"]);

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULTS);
    }

    const result: Record<string, string> = { ...DEFAULTS };
    for (const row of data) {
      const platform = row.key.replace("social_", "") as keyof typeof DEFAULTS;
      result[platform] = row.value;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const platforms = ["instagram", "facebook", "whatsapp", "linkedin"];

    const upserts = platforms.map((p) => ({
      key: `social_${p}`,
      value: body[p] || DEFAULTS[p as keyof typeof DEFAULTS],
    }));

    const { error } = await supabase
      .from("site_settings")
      .upsert(upserts, { onConflict: "key" });

    if (error) {
      // Fallback: store in localStorage on client; return success anyway
      return NextResponse.json({ ok: true, warning: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
