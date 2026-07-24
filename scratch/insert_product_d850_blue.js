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

  // We use the first image which is completely brand-clean and professional
  const srcName = 'media__1784891443441.jpg';
  const dstName = 'diaphragm-ccaw-d850-blue.jpg';
  
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
  const productName = "SPEAKER DIAPHRAGM CCAW D-850 8 OHM BLUE";
  const productSlug = "speaker-diaphragm-ccaw-d-850-8-ohm-blue";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring an anodized blue titanium dome dome and heavy-duty CCAW (Copper Clad Aluminum Wire) voice coil for D-850 drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom blue-anodized dome and frame assembly tailored for D-850 professional compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable former, it provides clean, precise high-frequency reproduction with superior power limits. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "blue diaphragm", "d-850", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-850 professional compression drivers, tweeter maintenance, PA system repair, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-850 8 OHM BLUE | Global Speaker Parts",
        description: "Premium blue-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil for D-850 drivers."
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
      name: "CCAW D-850 8 OHM BLUE",
      price: 9.50,
      stock: 800,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Blue Anodized Titanium / CCAW Voice Coil",
        "Impedance": "8 Ohm",
        "Voice Coil Diameter": "85.0 mm",
        "Diaphragm Outer Diameter": "110 mm",
        "Power Capacity": "150W RMS",
        "Frequency Range": "800 Hz - 18 kHz"
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
  console.log("D-850 Blue Diaphragm product listing fully complete!");
}

main().catch(console.error);
