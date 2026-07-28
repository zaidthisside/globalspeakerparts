import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "scratch", "payment_settings.json");

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
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
    enableCashfree: !!process.env.NEXT_PUBLIC_CASHFREE_APP_ID || false,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET || "",
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    cashfreeAppId: process.env.NEXT_PUBLIC_CASHFREE_APP_ID || "",
    cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || "",
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
          enableCashfree: data.enable_cashfree || false,
          razorpayKeyId: data.razorpay_key_id || "",
          razorpaySecret: data.razorpay_secret || "",
          paypalClientId: data.paypal_client_id || "",
          paypalSecret: data.paypal_secret || "",
          cashfreeAppId: data.cashfree_app_id || "",
          cashfreeSecretKey: data.cashfree_secret_key || "",
          environment: data.environment || "sandbox",
          defaultCurrency: data.default_currency || "USD",
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
      cashfreeSecretKey: settings.cashfreeSecretKey ? "••••••••••••••••" : "",
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
          enableCashfree: data.enable_cashfree || false,
          razorpayKeyId: data.razorpay_key_id || "",
          razorpaySecret: data.razorpay_secret || "",
          paypalClientId: data.paypal_client_id || "",
          paypalSecret: data.paypal_secret || "",
          cashfreeAppId: data.cashfree_app_id || "",
          cashfreeSecretKey: data.cashfree_secret_key || "",
          environment: data.environment || "sandbox",
          defaultCurrency: data.default_currency || "USD",
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
    const cashfreeSecretKey =
      body.cashfreeSecretKey === "••••••••••••••••"
        ? existing.cashfreeSecretKey
        : body.cashfreeSecretKey;

    const newSettings = {
      enableRazorpay: body.enableRazorpay ?? existing.enableRazorpay,
      enablePaypal: body.enablePaypal ?? existing.enablePaypal,
      enableCashfree: body.enableCashfree ?? existing.enableCashfree,
      razorpayKeyId: body.razorpayKeyId ?? existing.razorpayKeyId,
      razorpaySecret: razorpaySecret ?? existing.razorpaySecret,
      paypalClientId: body.paypalClientId ?? existing.paypalClientId,
      paypalSecret: paypalSecret ?? existing.paypalSecret,
      cashfreeAppId: body.cashfreeAppId ?? existing.cashfreeAppId,
      cashfreeSecretKey: cashfreeSecretKey ?? existing.cashfreeSecretKey,
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
          enable_cashfree: newSettings.enableCashfree,
          razorpay_key_id: newSettings.razorpayKeyId,
          razorpay_secret: newSettings.razorpaySecret,
          paypal_client_id: newSettings.paypalClientId,
          paypal_secret: newSettings.paypalSecret,
          cashfree_app_id: newSettings.cashfreeAppId,
          cashfree_secret_key: newSettings.cashfreeSecretKey,
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
        cashfreeSecretKey: newSettings.cashfreeSecretKey ? "••••••••••••••••" : "",
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
