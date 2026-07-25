import fs from "fs";
import path from "path";

export interface GatewayKeys {
  razorpayKeyId: string;
  razorpaySecret: string;
  paypalClientId: string;
  paypalSecret: string;
  paypalEnvironment: "sandbox" | "live";
}

export function getGatewayKeys(): GatewayKeys {
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
      console.error("Failed to read payment settings:", e);
    }
  }

  return {
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET || "",
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    paypalEnvironment: (process.env.PAYPAL_ENVIRONMENT || "sandbox") as "sandbox" | "live",
  };
}
