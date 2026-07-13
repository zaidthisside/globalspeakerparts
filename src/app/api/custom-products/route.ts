import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ProductItem {
  id?: string;
  name: string;
  category: string;
  desc: string;
  materials: string;
  dimensions: string;
  tempLimit: string;
  frequencyRange: string;
  tolerances: string;
  startingPrice: string;
  moq: string;
  variants: string;
  imageKey: string;
  mediaUrls?: string;
  mediaList?: string[];
  compliance?: string;
}

const filePath = path.join(process.cwd(), "custom_products.json");
const CLOUD_URL = "https://extendsclass.com/api/json-storage/bin/cadeade";

// Local file backup helpers
function readLocal(): ProductItem[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Local database read failed:", e);
  }
  return [];
}

function writeLocal(data: ProductItem[]) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Local database write failed:", e);
  }
}

export async function GET() {
  try {
    const res = await fetch(CLOUD_URL, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        writeLocal(data); // Sync local backup
        return NextResponse.json(data);
      }
    }
  } catch (error) {
    console.error("GET cloud products error, falling back:", error);
  }

  // Fallback to local file backup
  return NextResponse.json(readLocal());
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    
    // Get existing products list (try cloud first)
    let products: ProductItem[] = [];
    try {
      const res = await fetch(CLOUD_URL, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          products = data;
        }
      } else {
        products = readLocal();
      }
    } catch (e) {
      console.warn("Cloud read failed in POST, trying local read:", e);
      products = readLocal();
    }

    let updatedProducts: ProductItem[] = [];
    if (product.action === "delete") {
      updatedProducts = products.filter((p: { id?: string }) => p.id !== product.id);
    } else {
      const existingIndex = products.findIndex((p: { id?: string }) => p.id === product.id);
      if (existingIndex > -1) {
        products[existingIndex] = product;
        updatedProducts = [...products];
      } else {
        updatedProducts = [product, ...products];
      }
    }

    // Save local backup
    writeLocal(updatedProducts);

    // Save to Cloud storage
    try {
      await fetch(CLOUD_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProducts)
      });
    } catch (cloudError) {
      console.error("POST cloud update failed:", cloudError);
    }

    return NextResponse.json({ success: true, products: updatedProducts });
  } catch (error) {
    console.error("POST custom products error:", error);
    return NextResponse.json({ error: "Failed to write custom products" }, { status: 550 });
  }
}
