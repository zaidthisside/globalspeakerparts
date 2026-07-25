import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

const SETTINGS_FILE_PATH = path.join(
  process.cwd(),
  "scratch",
  "payment_settings.json"
);

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    try {
      fs.mkdirSync(dirname, { recursive: true });
    } catch (e) {
      console.warn("Failed to create directory locally (filesystem might be read-only):", e);
    }
  }
}

function loadSettingsFromFile() {
  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read payment settings from file:", err);
    }
  }

  // Fallback to env variables if settings file does not exist
  return {
    enableRazorpay: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || false,
    enablePaypal: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || false,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET || "",
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
    defaultCurrency: "USD",
  };
}

export async function GET() {
  try {
    let settings = null;

    // 1. Try fetching from Supabase table
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("id", "default")
        .single();
      
      if (data && !error) {
        settings = {
          enableRazorpay: data.enable_razorpay,
          enablePaypal: data.enable_paypal,
          razorpayKeyId: data.razorpay_key_id,
          razorpaySecret: data.razorpay_secret,
          paypalClientId: data.paypal_client_id,
          paypalSecret: data.paypal_secret,
          environment: data.environment,
          defaultCurrency: data.default_currency,
        };
      }
    } catch (dbError) {
      console.warn("Failed to query settings from Supabase database:", dbError);
    }

    // 2. Fall back to local file / env config if not found in DB
    if (!settings) {
      settings = loadSettingsFromFile();
    }

    // Sanitize secrets before sending to frontend
    const sanitized = {
      ...settings,
      razorpaySecret: settings.razorpaySecret ? "••••••••••••••••" : "",
      paypalSecret: settings.paypalSecret ? "••••••••••••••••" : "",
    };

    return NextResponse.json(sanitized);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Load existing settings to resolve masked values
    let existing = null;
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("id", "default")
        .single();
      
      if (data && !error) {
        existing = {
          enableRazorpay: data.enable_razorpay,
          enablePaypal: data.enable_paypal,
          razorpayKeyId: data.razorpay_key_id,
          razorpaySecret: data.razorpay_secret,
          paypalClientId: data.paypal_client_id,
          paypalSecret: data.paypal_secret,
          environment: data.environment,
          defaultCurrency: data.default_currency,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch failed during settings update:", e);
    }

    if (!existing) {
      existing = loadSettingsFromFile();
    }

    // Resolve masked secrets
    const razorpaySecret =
      body.razorpaySecret === "••••••••••••••••"
        ? existing.razorpaySecret
        : body.razorpaySecret;
    const paypalSecret =
      body.paypalSecret === "••••••••••••••••"
        ? existing.paypalSecret
        : body.paypalSecret;

    const newSettings = {
      enableRazorpay: body.enableRazorpay ?? existing.enableRazorpay,
      enablePaypal: body.enablePaypal ?? existing.enablePaypal,
      razorpayKeyId: body.razorpayKeyId ?? existing.razorpayKeyId,
      razorpaySecret: razorpaySecret ?? existing.razorpaySecret,
      paypalClientId: body.paypalClientId ?? existing.paypalClientId,
      paypalSecret: paypalSecret ?? existing.paypalSecret,
      environment: body.environment ?? existing.environment,
      defaultCurrency: body.defaultCurrency ?? existing.defaultCurrency,
    };

    let savedToDb = false;

    // 2. Try saving to Supabase
    try {
      const { error } = await supabase
        .from("payment_settings")
        .upsert({
          id: "default",
          enable_razorpay: newSettings.enableRazorpay,
          enable_paypal: newSettings.enablePaypal,
          razorpay_key_id: newSettings.razorpayKeyId,
          razorpay_secret: newSettings.razorpaySecret,
          paypal_client_id: newSettings.paypalClientId,
          paypal_secret: newSettings.paypalSecret,
          environment: newSettings.environment,
          default_currency: newSettings.defaultCurrency,
          updated_at: new Date().toISOString(),
        });
      
      if (!error) {
        savedToDb = true;
      } else {
        console.error("Supabase upsert error for payment_settings:", error.message);
      }
    } catch (dbError) {
      console.error("Database save failed for payment_settings:", dbError);
    }

    // 3. Fall back to local file storage (if database is not ready or failed)
    try {
      ensureDirectoryExists(SETTINGS_FILE_PATH);
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), "utf-8");
    } catch (fileError) {
      console.warn("Failed to write settings to local file (read-only filesystem):", fileError);
      if (!savedToDb) {
        throw new Error("Could not save settings to database or local filesystem.");
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...newSettings,
        razorpaySecret: newSettings.razorpaySecret ? "••••••••••••••••" : "",
        paypalSecret: newSettings.paypalSecret ? "••••••••••••••••" : "",
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
