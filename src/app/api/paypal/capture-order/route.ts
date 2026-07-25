import { NextRequest, NextResponse } from "next/server";
import { getGatewayKeys } from "@/lib/paymentHelper";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

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
    const { orderID, order } = await req.json();

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
    
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PayPal Capture Order Error]:", errorText);
      return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 500 });
    }

    const data = await response.json();

    if (data.status === "COMPLETED") {
      // 1. Generate Order Number
      const orderNumber = `GSP-SMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = crypto.randomUUID();

      const orderData = {
        id: orderId,
        order_number: orderNumber,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone || "",
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_zip: order.shipping_zip,
        shipping_country: order.shipping_country,
        product_id: order.product_id,
        product_name: order.product_name,
        variant_name: order.variant_name,
        quantity: order.quantity,
        unit_price: order.unit_price,
        subtotal: order.subtotal,
        shipping_fee: order.shipping_fee,
        total: order.total,
        status: "Payment Confirmed",
      };

      // Create order via internal API call
      const origin = new URL(req.url).origin;
      const orderResponse = await fetch(`${origin}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to insert order into database during PayPal capture");
      }

      // 2. Create Payment Record
      const paymentData = {
        id: crypto.randomUUID(),
        order_id: orderId,
        order_number: orderNumber,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone || "",
        payment_gateway: "PayPal",
        gateway_payment_id: data.purchase_units[0]?.payments?.captures[0]?.id || data.id,
        gateway_order_id: data.id,
        transaction_id: data.purchase_units[0]?.payments?.captures[0]?.id || data.id,
        currency: "USD",
        amount: order.total,
        payment_status: "Paid",
        payment_date: new Date().toISOString(),
        refund_status: null,
        refund_amount: 0,
        gateway_response: data,
      };

      const paymentResponse = await fetch(`${origin}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to insert payment record during PayPal capture");
      }

      // 3. Send Order Confirmation Email
      await sendOrderConfirmationEmail({
        orderNumber,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        productName: order.product_name,
        variantName: order.variant_name,
        quantity: order.quantity,
        unitPrice: order.unit_price,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        total: order.total,
        gateway: "PayPal",
        transactionId: paymentData.transaction_id,
      });

      return NextResponse.json({
        status: "success",
        verified: true,
        order_number: orderNumber,
        transaction_id: paymentData.transaction_id,
        paypal_response: data,
      });
    }

    return NextResponse.json({ error: "PayPal order not completed yet", paypal_status: data.status }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
