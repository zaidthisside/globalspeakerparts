import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

export interface GatewayKeys {
  razorpayKeyId: string;
  razorpaySecret: string;
  paypalClientId: string;
  paypalSecret: string;
  paypalEnvironment: "sandbox" | "live";
}

export async function getGatewayKeys(): Promise<GatewayKeys> {
  // 1. Try Supabase Database first
  try {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (data && !error) {
      return {
        razorpayKeyId: data.razorpay_key_id || "",
        razorpaySecret: data.razorpay_secret || "",
        paypalClientId: data.paypal_client_id || "",
        paypalSecret: data.paypal_secret || "",
        paypalEnvironment: (data.environment || "sandbox") as "sandbox" | "live",
      };
    }
  } catch (e) {
    console.warn("Supabase query error on payment_settings, falling back:", e);
  }

  // 2. Fallback to Local JSON Settings file
  const settingsPath = path.join(process.cwd(), "scratch", "payment_settings.json");
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      return {
        razorpayKeyId: settings.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        razorpaySecret: settings.razorpaySecret || process.env.RAZORPAY_KEY_SECRET || "",
        paypalClientId: settings.paypalClientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        paypalSecret: settings.paypalSecret || process.env.PAYPAL_CLIENT_SECRET || "",
        paypalEnvironment: (settings.environment || process.env.PAYPAL_ENVIRONMENT || "sandbox") as "sandbox" | "live",
      };
    } catch (e) {
      console.error("Failed to read payment settings JSON:", e);
    }
  }

  // 3. Fallback to Environment Variables
  return {
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET || "",
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    paypalEnvironment: (process.env.PAYPAL_ENVIRONMENT || "sandbox") as "sandbox" | "live",
  };
}
