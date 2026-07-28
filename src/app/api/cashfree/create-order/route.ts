import { NextRequest, NextResponse } from "next/server";
import { getGatewayKeys } from "@/lib/paymentHelper";

export async function POST(req: NextRequest) {
  try {
    const { amount, customerName, customerEmail, customerPhone } = await req.json();

    const keys = await getGatewayKeys();
    const appId = keys.cashfreeAppId;
    const secretKey = keys.cashfreeSecretKey;
    const isProd = keys.paypalEnvironment === "live";

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: "Cashfree credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const host = isProd ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
    const cfOrderId = `CF-SMP-${Math.floor(100000 + Math.random() * 900000)}`;

    // Sanitize phone number (Cashfree requires a 10-digit number)
    let sanitizedPhone = (customerPhone || "").replace(/\D/g, "");
    if (sanitizedPhone.length < 10) {
      sanitizedPhone = "9999999999";
    } else {
      sanitizedPhone = sanitizedPhone.slice(-10);
    }

    const response = await fetch(`${host}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: cfOrderId,
        order_amount: Number(amount.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: `CUST-${Date.now()}`,
          customer_name: customerName || "Guest Buyer",
          customer_email: customerEmail || "buyer@example.com",
          customer_phone: sanitizedPhone,
        },
        order_meta: {
          return_url: `${new URL(req.url).origin}/checkout?gateway=cashfree&cf_order_id=${cfOrderId}`,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cashfree Order Creation Error]:", errorText);
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }
      return NextResponse.json({ error: errorJson.message || "Failed to create Cashfree order", detail: errorJson }, { status: 400 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
