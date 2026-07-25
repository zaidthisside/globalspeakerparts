const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const artifactsDir = "C:\\Users\\aleen\\.gemini\\antigravity\\brain\\7cbf25c8-50be-42d9-92b7-274d53645724\\.user_uploaded";
  const publicDir = path.join(__dirname, '..', 'public');

  const srcName = 'media__1784965064630.jpg';
  const dstName = 'terminal-gold-red-black.jpg';
  
  const srcPath = path.join(artifactsDir, srcName);
  const dstPath = path.join(publicDir, dstName);

  console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
  await sharp(srcPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dstPath);
  console.log("Image optimized and saved!");

  // Database Insertion
  const categoryId = "1833a171-d264-4239-9042-176b6a8e673d"; // Speaker Terminals Category ID
  const productName = "SPEAKER TERMINAL RED-BLACK WIRE IN GOLD";
  const productSlug = "speaker-terminal-red-black-wire-in-gold";
  
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
      short_desc: "Premium gold-plated speaker binding post terminals featuring red and black color-coded rings for secure, high-fidelity wire connections.",
      long_desc: "This pair of premium gold-plated speaker binding post terminals (one red, one black) is engineered for high-performance audio applications, custom speaker builds, and amplifier terminal replacements. The heavy-duty gold plating ensures maximum signal transfer and corrosion resistance, while the knurled thumb screws provide a secure grip for bare wire, spade lugs, or banana plugs.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: false,
      tags: ["speaker terminals", "binding posts", "gold plated", "speaker hardware", "audio connectors"],
      applications: "Hi-Fi speaker cabinet terminal replacement, amplifier output posts, custom speaker design, and professional audio connections.",
      moq: "100 pairs",
      sort_order: 0,
      seo_meta: {
        title: "Gold-Plated Speaker Terminal binding Post Pairs | Global Speaker Parts",
        description: "Premium gold-plated red & black speaker terminals for high-performance audio connectivity.",
        hide_price: true
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
      name: "Gold Terminal Pair (Red/Black)",
      price: 1.80,
      stock: 3000,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Gold-Plated Brass & Durable Polymer",
        "Color-Coding": "Red & Black Pairs",
        "Thread Size": "M6 standard thread",
        "Connector Types": "Bare wire, Banana plugs, Spade lugs"
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
  console.log("Gold Speaker Terminal pair product listing fully complete!");
}

main().catch(console.error);
