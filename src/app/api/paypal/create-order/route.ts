import { NextRequest, NextResponse } from "next/server";
import { getGatewayKeys } from "@/lib/paymentHelper";

async function getAccessToken(clientId: string, clientSecret: string, environment: "sandbox" | "live") {
  const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("Failed to retrieve PayPal access token");
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "USD" } = await req.json();

    const keys = getGatewayKeys();
    const clientId = keys.paypalClientId;
    const clientSecret = keys.paypalSecret;
    const environment = keys.paypalEnvironment;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken(clientId, clientSecret, environment);
    const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PayPal Order Creation Error]:", errorText);
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
