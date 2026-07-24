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
  
  const srcName = 'media__1784873654758.jpg';
  const dstName = 'diaphragm-ccaw-d450-blue.jpg';
  
  const srcPath = path.join(artifactsDir, srcName);
  const dstPath = path.join(publicDir, dstName);

  console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);

  console.log("Image optimized and saved to public folder!");

  // Database Insertion
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-450 8 OHM BLUE";
  const productSlug = "speaker-diaphragm-ccaw-d-450-8-ohm-blue";
  
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
      short_desc: "Premium high-performance replacement speaker diaphragm in signature Blue anodized finish. Featuring high-temperature CCAW (Copper Clad Aluminum Wire) voice coil for ultimate tonal precision.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom blue-anodized frame assembly. Wound with precision Copper Clad Aluminum Wire (CCAW) on a high-temperature Kapton former, it offers excellent high-frequency response, high sensitivity, and heavy power capacity. Ideal for premium compression drivers and professional PA applications.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "blue diaphragm", "speaker diaphragm"],
      applications: "Replacement diaphragm for premium professional compression drivers, high-end tweeter replacement, PA system customization, and wholesale speaker component distribution.",
      moq: "100 units",
      sort_order: 8,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-450 8 OHM BLUE | Global Speaker Parts",
        description: "Premium blue-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil."
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
      name: "CCAW D-450 8 OHM BLUE",
      price: 5.20,
      stock: 1200,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Blue Anodized Frame / Titanium Dome / CCAW Voice Coil",
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
  console.log("Blue Diaphragm product listing fully complete!");
}

main().catch(console.error);
