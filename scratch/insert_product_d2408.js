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

  const srcName = 'diaphragm_d2408_clean_1784892559218.jpg';
  const dstName = 'diaphragm-d2408.jpg';
  
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
  const productName = "SPEAKER DIAPHRAGM D-2408";
  const productSlug = "speaker-diaphragm-d-2408";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring a high-precision titanium dome and grey phase-plug cone assembly for D-2408 compression drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom titanium dome and integrated grey central phase-plug cone assembly tailored for D-2408 professional compression drivers. Engineered to meet strict performance tolerances, it provides clean, precise high-frequency response and reliable power handling. Ideal for professional sound reinforcement, touring speaker maintenance, and wholesale parts distribution.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "titanium dome", "compression drivers", "d-2408", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-2408 compression drivers, PA system speaker repair, stage monitor maintenance, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM D-2408 | Global Speaker Parts",
        description: "Premium replacement speaker diaphragm with grey phase-plug cone assembly for D-2408 drivers."
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
      name: "D-2408 8 OHM",
      price: 6.50,
      stock: 750,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Titanium Dome / Polyimide Surround / Grey Cone Phase-Plug",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "38 mm",
        "Diaphragm Outer Diameter": "68 mm",
        "Power Capacity": "60W RMS",
        "Frequency Range": "1.5 kHz - 20 kHz"
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
  console.log("D-2408 Diaphragm product listing fully complete!");
}

main().catch(console.error);
