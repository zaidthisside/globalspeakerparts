import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import fs from "fs";
import path from "path";

const ORDERS_FILE_PATH = path.join(process.cwd(), "scratch", "orders.json");

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function loadLocalOrders(): any[] {
  ensureDirectoryExists(ORDERS_FILE_PATH);
  if (fs.existsSync(ORDERS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read local orders:", err);
    }
  }
  return [];
}

function saveLocalOrder(order: any) {
  const orders = loadLocalOrders();
  // Check for duplicate orders by order_number
  if (orders.some((o) => o.order_number === order.order_number)) {
    return;
  }
  orders.unshift(order);
  fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "100");

    // 1. Try querying Supabase
    const { data: dbOrders, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!dbError && dbOrders) {
      return NextResponse.json(dbOrders);
    }

    // 2. Fallback to Local JSON Storage
    console.warn("Falling back to local orders.json storage. Reason:", dbError?.message);
    const localOrders = loadLocalOrders();
    return NextResponse.json(localOrders.slice(0, limit));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();

    if (!orderData.order_number) {
      return NextResponse.json({ error: "order_number is required" }, { status: 400 });
    }

    // 1. Try inserting into Supabase
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ success: true, source: "database", data });
    }

    // 2. Fallback to Local JSON Storage
    console.warn("Failed inserting order to Supabase. Saving locally instead. Reason:", error?.message);
    
    const localOrder = {
      id: orderData.id || crypto.randomUUID(),
      ...orderData,
      created_at: orderData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    saveLocalOrder(localOrder);
    return NextResponse.json({ success: true, source: "local", data: localOrder });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
