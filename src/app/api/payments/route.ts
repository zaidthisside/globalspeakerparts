import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

const PAYMENTS_FILE_PATH = path.join(process.cwd(), "scratch", "payments.json");

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function loadLocalPayments(): any[] {
  ensureDirectoryExists(PAYMENTS_FILE_PATH);
  if (fs.existsSync(PAYMENTS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(PAYMENTS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read local payments:", err);
    }
  }
  return [];
}

function saveLocalPayment(payment: any) {
  const payments = loadLocalPayments();
  const index = payments.findIndex((p) => p.transaction_id === payment.transaction_id || p.id === payment.id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...payment, updated_at: new Date().toISOString() };
  } else {
    payments.unshift(payment);
  }
  fs.writeFileSync(PAYMENTS_FILE_PATH, JSON.stringify(payments, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "100");

    // 1. Try querying Supabase
    const { data: dbPayments, error: dbError } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!dbError && dbPayments) {
      return NextResponse.json(dbPayments);
    }

    // 2. Fallback to Local JSON Storage
    console.warn("Falling back to local payments.json storage. Reason:", dbError?.message);
    const localPayments = loadLocalPayments();
    return NextResponse.json(localPayments.slice(0, limit));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const paymentData = await req.json();

    // 1. Try inserting into Supabase
    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ success: true, source: "database", data });
    }

    // 2. Fallback to Local JSON Storage
    console.warn("Failed inserting payment to Supabase. Saving locally instead. Reason:", error?.message);
    const localPayment = {
      id: paymentData.id || crypto.randomUUID(),
      ...paymentData,
      created_at: paymentData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalPayment(localPayment);
    return NextResponse.json({ success: true, source: "local", data: localPayment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updateData = await req.json();
    const { id, payment_status, refund_status, refund_amount, gateway_response } = updateData;

    if (!id) {
      return NextResponse.json({ error: "id is required to update payment" }, { status: 400 });
    }

    // 1. Try updating in Supabase
    const { data, error } = await supabase
      .from("payments")
      .update({
        payment_status,
        refund_status,
        refund_amount,
        gateway_response,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ success: true, source: "database", data });
    }

    // 2. Fallback to Local JSON Storage
    console.warn("Failed updating payment in Supabase. Updating locally instead. Reason:", error?.message);
    const localPayments = loadLocalPayments();
    const payment = localPayments.find((p) => p.id === id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found locally" }, { status: 404 });
    }

    const updatedPayment = {
      ...payment,
      payment_status: payment_status ?? payment.payment_status,
      refund_status: refund_status ?? payment.refund_status,
      refund_amount: refund_amount ?? payment.refund_amount,
      gateway_response: gateway_response ? { ...payment.gateway_response, ...gateway_response } : payment.gateway_response,
      updated_at: new Date().toISOString(),
    };

    saveLocalPayment(updatedPayment);

    // Also update order status in orders locally if needed
    if (payment_status) {
      const ordersPath = path.join(process.cwd(), "scratch", "orders.json");
      if (fs.existsSync(ordersPath)) {
        try {
          const orders = JSON.parse(fs.readFileSync(ordersPath, "utf-8"));
          const orderIndex = orders.findIndex((o: any) => o.id === payment.order_id);
          if (orderIndex !== -1) {
            orders[orderIndex].status = payment_status === "Refunded" ? "Refunded" : payment_status === "Paid" ? "Paid" : "Failed";
            fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), "utf-8");
          }
        } catch (e) {
          console.error("Failed to update status in orders.json:", e);
        }
      }
    }

    return NextResponse.json({ success: true, source: "local", data: updatedPayment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
