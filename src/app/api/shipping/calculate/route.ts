import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "United States";
    const zip = (searchParams.get("zip") || "").trim();
    const productId = searchParams.get("productId");
    const quantity = Number(searchParams.get("quantity") || "1");

    if (!zip) {
      return NextResponse.json({ error: "Postal code is required" }, { status: 400 });
    }

    // 1. Fetch product to determine realistic B2B weight
    let weightPerItem = 0.15; // default 150g per item
    if (productId) {
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", productId)
        .single();
      
      if (product && product.name) {
        const nameLower = product.name.toLowerCase();
        if (nameLower.includes("foam") || nameLower.includes("surround") || nameLower.includes("edge") || nameLower.includes("cap") || nameLower.includes("gasket")) {
          weightPerItem = 0.05; // 50g
        } else if (nameLower.includes("port") || nameLower.includes("tube")) {
          weightPerItem = 0.25; // 250g
        } else if (nameLower.includes("coil") || nameLower.includes("diaphragm")) {
          weightPerItem = 0.08; // 80g
        } else if (nameLower.includes("frame") || nameLower.includes("basket") || nameLower.includes("spider")) {
          weightPerItem = 0.45; // 450g
        }
      }
    }

    const totalWeight = weightPerItem * quantity;

    // 2. Shipping calculation logic based on Country & ZIP Code
    let shippingFee = 15.00; // default base USD
    let carrier = "DHL Express Air";
    let estimatedDays = "3-5 Business Days";

    const isIndia = country.toLowerCase() === "india";

    if (isIndia) {
      // Domestic rate calculation
      // Clean pincode (digits only)
      const cleanZip = zip.replace(/\D/g, "");
      if (cleanZip.length !== 6) {
        return NextResponse.json({ error: "Invalid 6-digit Indian Pincode" }, { status: 400 });
      }

      const firstDigit = cleanZip[0];
      carrier = "Delhivery Express Air";
      
      // Calculate zone rates based on first digit of pincode
      if (firstDigit === "1" || firstDigit === "2") {
        // Zone A: North (Delhi, NCR, Punjab, UP)
        shippingFee = 1.80 + (totalWeight * 0.90);
        estimatedDays = "1-2 Business Days";
      } else if (firstDigit === "3" || firstDigit === "4") {
        // Zone B: West/Central (Mumbai, Gujarat, Maharashtra)
        shippingFee = 2.40 + (totalWeight * 1.20);
        estimatedDays = "2-3 Business Days";
      } else if (firstDigit === "5" || firstDigit === "6") {
        // Zone C: South (Bangalore, Chennai, Karnataka, Kerala)
        shippingFee = 2.80 + (totalWeight * 1.40);
        estimatedDays = "2-3 Business Days";
      } else if (firstDigit === "7" || firstDigit === "8") {
        // Zone D: East (Kolkata, WB, Bihar)
        shippingFee = 3.20 + (totalWeight * 1.60);
        estimatedDays = "3-4 Business Days";
      } else {
        // Zone E: Northeast / Remote (Assam, J&K, Islands)
        shippingFee = 4.50 + (totalWeight * 2.20);
        estimatedDays = "4-5 Business Days";
      }
    } else {
      // International rate calculation
      if (country.toLowerCase() === "united states" || country.toLowerCase() === "canada") {
        // North America
        shippingFee = 14.50 + (totalWeight * 6.80);
        carrier = "FedEx Priority International";
        estimatedDays = "3-5 Business Days";
      } else if (["germany", "france", "united kingdom", "italy", "spain", "netherlands", "sweden", "switzerland"].includes(country.toLowerCase())) {
        // Western Europe
        shippingFee = 12.80 + (totalWeight * 5.40);
        carrier = "DHL Express Worldwide";
        estimatedDays = "3-4 Business Days";
      } else if (["japan", "south korea", "australia", "singapore", "new zealand"].includes(country.toLowerCase())) {
        // APAC
        shippingFee = 11.20 + (totalWeight * 4.90);
        carrier = "DHL Express Worldwide";
        estimatedDays = "2-4 Business Days";
      } else {
        // Rest of the World
        shippingFee = 19.50 + (totalWeight * 8.50);
        carrier = "FedEx International Connect";
        estimatedDays = "5-7 Business Days";
      }
    }

    // Round shipping fee to 2 decimal places
    shippingFee = Number(shippingFee.toFixed(2));

    return NextResponse.json({
      success: true,
      shippingFee,
      carrier,
      estimatedDays,
      totalWeightKg: totalWeight,
    });
  } catch (err) {
    console.error("[Shipping Calculation Error]:", err);
    return NextResponse.json({ error: "Internal calculation error" }, { status: 500 });
  }
}
