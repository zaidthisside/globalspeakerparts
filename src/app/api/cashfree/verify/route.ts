import { NextRequest, NextResponse } from "next/server";
import { getGatewayKeys } from "@/lib/paymentHelper";

export async function POST(req: NextRequest) {
  try {
    const { cf_order_id, order } = await req.json();

    if (!cf_order_id || !order) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

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

    // 1. Fetch order details from Cashfree API
    const response = await fetch(`${host}/pg/orders/${cf_order_id}`, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cashfree Verification API Error]:", errorText);
      return NextResponse.json({ error: "Failed to verify Cashfree order status" }, { status: 500 });
    }

    const data = await response.json();

    // Verify order status is PAID
    if (data.order_status === "PAID") {
      const orderId = crypto.randomUUID();
      const origin = new URL(req.url).origin;

      const orderData = {
        id: orderId,
        order_number: cf_order_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone || "",
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state || "",
        shipping_zip: order.shipping_zip || "",
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
      const orderResponse = await fetch(`${origin}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to insert order into database during Cashfree verification");
      }

      // Create Payment Record
      const paymentData = {
        id: crypto.randomUUID(),
        order_id: orderId,
        order_number: cf_order_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone || "",
        payment_gateway: "Cashfree",
        gateway_payment_id: cf_order_id,
        gateway_order_id: cf_order_id,
        transaction_id: cf_order_id,
        currency: "INR",
        amount: order.total * 83.5, // Convert base total to INR
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
        throw new Error("Failed to insert payment record during Cashfree verification");
      }

      return NextResponse.json({ success: true, transaction_id: cf_order_id });
    } else {
      console.warn(`[Cashfree Verification Warning]: Order status is ${data.order_status}`);
      return NextResponse.json({ success: false, error: `Payment not completed. Status: ${data.order_status}` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
