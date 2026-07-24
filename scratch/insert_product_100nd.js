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

  const srcName = 'diaphragm_100nd_clean_1784893441192.jpg';
  const dstName = 'diaphragm-100nd.jpg';
  
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
  const productName = "SPEAKER DIAPHRAGM 100ND";
  const productSlug = "speaker-diaphragm-100nd";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring an etched titanium dome and round black mounting flange for 100ND drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom etched titanium dome and round black mounting flange tailored for 100ND professional compression drivers. Engineered to meet strict performance tolerances, it provides clean, precise high-frequency response and reliable power handling. Ideal for professional sound reinforcement, touring speaker maintenance, and wholesale parts distribution.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "titanium dome", "compression drivers", "100nd", "speaker diaphragm"],
      applications: "Replacement diaphragm for 100ND compression drivers, PA system speaker repair, stage monitor maintenance, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM 100ND | Global Speaker Parts",
        description: "Premium replacement speaker diaphragm with etched titanium dome for 100ND drivers."
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
      name: "100ND 8 OHM",
      price: 12.50,
      stock: 500,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Titanium Dome / Circular Black Frame / CCAW Voice Coil",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "99.2 mm",
        "Diaphragm Outer Diameter": "127 mm",
        "Power Capacity": "150W RMS",
        "Frequency Range": "800 Hz - 20 kHz"
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
  console.log("100ND Diaphragm product listing fully complete!");
}

main().catch(console.error);
