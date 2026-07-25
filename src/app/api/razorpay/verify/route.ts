import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGatewayKeys } from "@/lib/paymentHelper";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = await req.json();

    const keys = await getGatewayKeys();
    const keySecret = keys.razorpaySecret;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
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

      // Create order via internal API call/helper logic
      const origin = new URL(req.url).origin;
      const orderResponse = await fetch(`${origin}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to insert order into database during Razorpay verification");
      }

      // 2. Create Payment Record
      const paymentData = {
        id: crypto.randomUUID(),
        order_id: orderId,
        order_number: orderNumber,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone || "",
        payment_gateway: "Razorpay",
        gateway_payment_id: razorpay_payment_id,
        gateway_order_id: razorpay_order_id,
        transaction_id: razorpay_payment_id,
        currency: "USD", // B2B base pricing is in USD
        amount: order.total,
        payment_status: "Paid",
        payment_date: new Date().toISOString(),
        refund_status: null,
        refund_amount: 0,
        gateway_response: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      };

      const paymentResponse = await fetch(`${origin}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to insert payment record during Razorpay verification");
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
        gateway: "Razorpay",
        transactionId: razorpay_payment_id,
      });

      return NextResponse.json({
        status: "success",
        verified: true,
        order_number: orderNumber,
        transaction_id: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        { status: "failed", verified: false, error: "Signature verification failed" },
        { status: 400 }
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
