import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "custom_products.json");

// Ensure directory and file exist
function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export async function GET() {
  try {
    ensureFile();
    const data = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("GET custom products error:", error);
    return NextResponse.json({ error: "Failed to read custom products" }, { status: 550 });
  }
}

export async function POST(request: Request) {
  try {
    ensureFile();
    const product = await request.json();
    const data = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(data);
    
    if (product.action === "delete") {
      const updated = products.filter((p: { id?: string }) => p.id !== product.id);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      return NextResponse.json({ success: true, products: updated });
    }

    const existingIndex = products.findIndex((p: { id?: string }) => p.id === product.id);
    if (existingIndex > -1) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("POST custom products error:", error);
    return NextResponse.json({ error: "Failed to write custom products" }, { status: 500 });
  }
}
