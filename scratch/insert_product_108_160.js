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

  const srcName = 'media__1784955508736.jpg';
  const dstName = 'surround-108-160.jpg';
  
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
  const productName = "SPEAKER FOAM SURROUND ID-108 MM, OD-160 MM";
  const productSlug = "speaker-foam-surround-id-108-mm-od-160-mm";
  
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
      short_desc: "Premium speaker foam surround replacement edge featuring a 160 mm outer diameter and 108 mm inner diameter.",
      long_desc: "This premium speaker foam surround is engineered for precision repairs of woofers and full-range speakers. Crafted from durable, highly flexible black foam, it provides excellent excursion compliance and resonance damping to restore original sound quality. Fits standard 6-inch to 6.5-inch drivers requiring precise ID-108mm and OD-160mm alignment.",
      featured_image: `/${dstName}`,
      is_hidden: false,
      is_featured: false,
      tags: ["speaker surrounds", "foam surround", "speaker repair", "6 inch", "speaker edge"],
      applications: "Speaker driver edge restoration, audio woofer surround repairs, professional sound re-coning, and distributor parts supply.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "Speaker Foam Surround ID 108mm OD 160mm Edge | Global Speaker Parts",
        description: "Premium replacement speaker foam surround edge for driver repair. Specs: OD 160mm, ID 108mm, Roll 144mm, Piston 119mm."
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
      name: "Foam Surround 108-160",
      price: 1.00,
      stock: 2000,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Flexible Black Textured Foam",
        "Outer Diameter (OD)": "160 mm",
        "Inner Diameter (ID)": "108 mm",
        "Roll Diameter": "144 mm",
        "Piston Diameter": "119 mm"
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
  console.log("Foam Surround 108-160 product listing fully complete!");
}

main().catch(console.error);
