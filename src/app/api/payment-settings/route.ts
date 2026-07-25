import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_FILE_PATH = path.join(
  process.cwd(),
  "scratch",
  "payment_settings.json"
);

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function loadSettings() {
  ensureDirectoryExists(SETTINGS_FILE_PATH);
  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read payment settings:", err);
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
    const settings = loadSettings();
    // Return sanitized settings to client (without exposing secret keys in frontend)
    // Wait, the client needs the public client ID/Key ID but not secrets.
    // However, the admin panel needs to load them to view/edit them.
    // Since this is a protected backend path, we can return the values, but to be safe, we can mask the secrets.
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
    const existing = loadSettings();

    // Preserve secrets if they are sent as masked placeholder
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

    ensureDirectoryExists(SETTINGS_FILE_PATH);
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings: {
      ...newSettings,
      razorpaySecret: newSettings.razorpaySecret ? "••••••••••••••••" : "",
      paypalSecret: newSettings.paypalSecret ? "••••••••••••••••" : "",
    }});
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
