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

  const srcName = 'surround_8_inverted_clean_1784952914070.jpg';
  const dstName = 'surround-8-inverted.jpg';
  
  const srcPath = path.join(artifactsDir, srcName);
  const dstPath = path.join(publicDir, dstName);

  console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);
  console.log("Image optimized and saved!");

  // Database Insertion
  const categoryId = "2f66de45-ad95-4aba-9b3f-db9de5980818"; // Speaker Surrounds Category ID
  const productName = "8\" INVERTED FOAM SURROUND ID-142 MM, OD-189 MM";
  const productSlug = "8-inverted-foam-surround-id-142-mm-od-189-mm";
  
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
      short_desc: "Premium 8-inch inverted foam surround replacement featuring a 189 mm outer diameter and 142 mm inner diameter.",
      long_desc: "This premium 8-inch inverted foam surround is designed for high-performance woofer and subwoofer speaker repairs. Engineered from dense, flexible, and durable black foam, it features an inverted roll profile to provide smooth, controlled cone excursion and excellent compliance. Perfect for restoring classic and modern 8-inch drivers with precise alignment dimensions.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: false,
      tags: ["speaker surrounds", "foam surround", "8 inch", "inverted surround", "speaker repair"],
      applications: "Woofer and subwoofer surround replacement, speaker edge repair, custom audio builds, and wholesale speaker component supply.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "8\" Inverted Foam Speaker Surround ID 142mm OD 189mm | Global Speaker Parts",
        description: "Premium replacement 8-inch inverted foam surround edge for speaker woofer repair. Specs: OD 189mm, ID 142mm, Roll 179mm, Piston 150mm."
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
      name: "Inverted Foam 8\"",
      price: 1.20,
      stock: 1500,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Dense Flexible Black Foam (Inverted Profile)",
        "Outer Diameter (OD)": "189 mm",
        "Inner Diameter (ID)": "142 mm",
        "Roll Diameter": "179 mm",
        "Piston Diameter": "150 mm"
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
  console.log("8\" Inverted Foam Surround product listing fully complete!");
}

main().catch(console.error);
