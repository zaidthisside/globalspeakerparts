const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const srcPath = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724\\media__1784877049728.jpg";
  const publicDir = path.join(__dirname, '..', 'public');
  const dstName = 'diaphragm-ccaw-d4480-aplus.jpg';
  const dstPath = path.join(publicDir, dstName);

  console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);
  console.log("Image optimized and saved!");

  // Database Insertion
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-4480 A PLUS 8 OHM";
  const productSlug = "speaker-diaphragm-ccaw-d-4480-a-plus-8-ohm";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring an advanced polyimide amber dome and heavy-duty CCAW (Copper Clad Aluminum Wire) voice coil for D-4480 A Plus drivers.",
      long_desc: "This premium A-Plus replacement speaker diaphragm features a custom polyimide amber dome and square yellow-composite housing tailored for high-frequency D-4480 A Plus compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable former, it provides clean, precise high-frequency reproduction with superior power limits. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "polyimide diaphragm", "d-4480-a-plus", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-4480 A Plus professional compression drivers, tweeter maintenance, PA system repair, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 4,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-4480 A PLUS 8 OHM | Global Speaker Parts",
        description: "Premium polyimide replacement speaker diaphragm featuring a high-temperature CCAW voice coil for D-4480 A Plus drivers."
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
      name: "CCAW D-4480 A PLUS 8 OHM",
      price: 5.50,
      stock: 1000,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Polyimide Amber Dome / CCAW Voice Coil",
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
  console.log("D-4480 A Plus Diaphragm product listing fully complete!");
}

main().catch(console.error);
