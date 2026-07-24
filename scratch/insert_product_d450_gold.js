const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-450 8 OHM GOLD";
  const productSlug = "speaker-diaphragm-ccaw-d-450-8-ohm-gold";
  
  console.log(`Inserting product "${productName}"...`);
  
  // 1. Delete if already exists to avoid unique constraint error
  await supabase.from('products').delete().eq('slug', productSlug);

  // 2. Insert product
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      category_id: categoryId,
      name: productName,
      slug: productSlug,
      short_desc: "Premium high-performance replacement speaker diaphragm in signature Gold anodized titanium finish. Featuring high-temperature CCAW (Copper Clad Aluminum Wire) voice coil for ultimate tonal precision.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom gold-anodized titanium dome and frame assembly. Wound with precision Copper Clad Aluminum Wire (CCAW) on a high-temperature Kapton former, it offers excellent high-frequency response, high sensitivity, and heavy power capacity. Ideal for premium compression drivers and professional PA applications.",
      featured_image: "/diaphragm-ccaw-d450-gold-1.jpg",
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "gold diaphragm", "speaker diaphragm"],
      applications: "Replacement diaphragm for premium professional compression drivers, high-end tweeter replacement, PA system customization, and wholesale speaker component distribution.",
      moq: "100 units",
      sort_order: 9,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-450 8 OHM GOLD | Global Speaker Parts",
        description: "Premium gold-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil."
      }
    })
    .select()
    .single();

  if (productError || !productData) {
    console.error("Error inserting product:", productError);
    return;
  }

  const productId = productData.id;
  console.log(`Product inserted successfully! ID: ${productId}`);

  // 3. Insert variant
  console.log("Inserting default variant...");
  const { data: variantData, error: variantError } = await supabase
    .from('variants')
    .insert({
      product_id: productId,
      name: "CCAW D-450 8 OHM GOLD",
      price: 5.20,
      stock: 1500,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Gold Anodized Titanium / CCAW Voice Coil",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "44.4 mm",
        "Diaphragm Outer Diameter": "72 mm",
        "Power Capacity": "90W RMS",
        "Frequency Range": "1.2 kHz - 20 kHz"
      }
    })
    .select()
    .single();

  if (variantError) {
    console.error("Error inserting variant:", variantError);
    return;
  }
  console.log(`Variant inserted successfully! ID: ${variantData.id}`);

  // 4. Insert product image gallery records (3 images)
  console.log("Inserting product gallery images...");
  const imageUrls = [
    "/diaphragm-ccaw-d450-gold-1.jpg",
    "/diaphragm-ccaw-d450-gold-2.jpg",
    "/diaphragm-ccaw-d450-gold-3.jpg"
  ];

  for (let i = 0; i < imageUrls.length; i++) {
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: imageUrls[i],
        alt_text: `${productName} View ${i + 1}`,
        order_index: i
      });

    if (imageError) {
      console.error(`Error inserting image ${imageUrls[i]}:`, imageError);
    } else {
      console.log(`Gallery image ${i + 1} inserted successfully!`);
    }
  }

  console.log("Diaphragm Gold product listing fully complete!");
}

main().catch(console.error);
