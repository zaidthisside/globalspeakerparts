const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-450 8 OHM";
  const productSlug = "speaker-diaphragm-ccaw-d-450-8-ohm";
  
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
      short_desc: "Premium high-frequency replacement speaker diaphragm featuring a high-temperature CCAW (Copper Clad Aluminum Wire) voice coil. Precision engineered to restore compression drivers to original acoustic output and tonal clarity.",
      long_desc: "This premium wholesale replacement speaker diaphragm is designed for professional high-frequency compression drivers. Wound with precision CCAW (Copper Clad Aluminum Wire) on a stable Kapton former, it offers exceptional power handling and thermal limits. Suited for B2B distributors and professional sound reinforcement setups.",
      featured_image: "/diaphragm-ccaw-d450-8.jpg",
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "speaker diaphragm"],
      applications: "Replacement diaphragm for high-power professional high-frequency compression drivers, PA system maintenance, and B2B wholesale parts distribution.",
      moq: "100 units",
      sort_order: 10,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-450 8 OHM | Global Speaker Parts",
        description: "Premium high-frequency replacement speaker diaphragm featuring a high-temperature CCAW voice coil."
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
      name: "CCAW D-450 8 OHM",
      price: 4.50,
      stock: 2500,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Titanium Dome / CCAW Voice Coil",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "44.4 mm",
        "Diaphragm Outer Diameter": "72 mm",
        "Power Capacity": "80W RMS",
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

  // 4. Insert product image gallery record
  console.log("Inserting product gallery image...");
  const { error: imageError } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: "/diaphragm-ccaw-d450-8.jpg",
      alt_text: productName,
      order_index: 0
    });

  if (imageError) {
    console.error("Error inserting product image:", imageError);
    return;
  }
  console.log("Product image gallery record inserted successfully!");
  console.log("Diaphragm product listing fully complete!");
}

main().catch(console.error);
