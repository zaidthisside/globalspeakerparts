const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724";
  const publicDir = path.join(__dirname, '..', 'public');

  const srcName = 'diaphragm_45_99_silver_clean_1784893770832.jpg';
  const dstName = 'diaphragm-ccaw-4599-silver.jpg';
  
  const srcPath = path.join(artifactsDir, srcName);
  const dstPath = path.join(publicDir, dstName);

  console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);
  console.log("Image optimized and saved!");

  // Database Insertion
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW 45.99 8 OHM SILVER";
  const productSlug = "speaker-diaphragm-ccaw-45-99-8-ohm-silver";
  
  console.log(`Inserting product "${productName}" into Supabase...`);
  
  // Delete existing first to avoid unique constraint issues
  await supabase.from('products').delete().eq('slug', productSlug);

  // Insert product record
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      category_id: categoryId,
      name: productName,
      slug: productSlug,
      short_desc: "Premium replacement speaker diaphragm featuring an advanced polyimide dome and silver anodized mounting rings for 45.99 drivers.",
      long_desc: "This premium replacement speaker diaphragm features a custom dark polyimide dome surround, protective center mesh, and dual silver-anodized mounting rings tailored for 45.99 professional compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable former, it provides clean, precise high-frequency response and superior power handling. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "polyimide diaphragm", "compression drivers", "8 ohm", "d-45-99", "speaker diaphragm"],
      applications: "Replacement diaphragm for 45.99 compression drivers, PA system speaker repair, stage monitor maintenance, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW 45.99 8 OHM SILVER | Global Speaker Parts",
        description: "Premium replacement speaker diaphragm with polyimide dome for 45.99 drivers."
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

  // Insert default variant
  console.log("Inserting default variant...");
  const { data: variantData, error: variantError } = await supabase
    .from('variants')
    .insert({
      product_id: productId,
      name: "CCAW 45.99 8 OHM SILVER",
      price: 6.00,
      stock: 1000,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Polyimide Dome / Silver Anodized Aluminum Rings / CCAW Voice Coil",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "45.9 mm",
        "Diaphragm Outer Diameter": "74 mm",
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

  // Insert product gallery image record
  console.log("Inserting product gallery image...");
  const { error: imageError } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: `/${dstName}`,
      alt_text: productName,
      order_index: 0
    });

  if (imageError) {
    console.error("Error inserting product image:", imageError);
    return;
  }
  console.log("Product image gallery record inserted successfully!");
  console.log("45.99 Silver Diaphragm product listing fully complete!");
}

main().catch(console.error);
