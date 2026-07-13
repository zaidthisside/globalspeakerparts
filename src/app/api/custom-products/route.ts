import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ProductItem {
  id?: string;
  action?: string;
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

function ensureFile() {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
  } catch (e) {
    console.error("ensureFile error:", e);
  }
}

function readProducts(): ProductItem[] {
  try {
    ensureFile();
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error("readProducts error:", e);
  }
  return [];
}

function writeProducts(products: ProductItem[]) {
  try {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("writeProducts error:", e);
  }
}

export async function GET() {
  const products = readProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const products = readProducts();

    let updatedProducts: ProductItem[];

    if (product.action === "delete") {
      updatedProducts = products.filter((p) => p.id !== product.id);
    } else {
      const existingIndex = products.findIndex((p) => p.id === product.id);
      if (existingIndex > -1) {
        products[existingIndex] = product;
        updatedProducts = [...products];
      } else {
        updatedProducts = [product, ...products];
      }
    }

    writeProducts(updatedProducts);

    return NextResponse.json(
      { success: true, products: updatedProducts },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("POST custom products error:", error);
    return NextResponse.json(
      { error: "Failed to write custom products" },
      { status: 500 }
    );
  }
}
