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

  const files = [
    { src: 'media__1784892160391.jpg', dst: 'diaphragm-ccaw-d450-cap-silver-1.jpg' }, // open dome view as main
    { src: 'media__1784892160329.jpg', dst: 'diaphragm-ccaw-d450-cap-silver-2.jpg' }  // capped view as secondary
  ];

  for (let i = 0; i < files.length; i++) {
    const srcPath = path.join(artifactsDir, files[i].src);
    const dstPath = path.join(publicDir, files[i].dst);

    console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
    await sharp(srcPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(dstPath);
    console.log(`Optimized and saved ${files[i].dst}`);
  }

  // Database Insertion
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-450 CAP 8 OHM SILVER";
  const productSlug = "speaker-diaphragm-ccaw-d-450-cap-8-ohm-silver";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring an anodized silver titanium dome and heavy-duty CCAW (Copper Clad Aluminum Wire) voice coil for D-450 CAP drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom silver-anodized dome and frame assembly with a rear protection cap tailored for D-450 CAP professional compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable former, it provides clean, precise high-frequency reproduction with superior power limits. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: "/diaphragm-ccaw-d450-cap-silver-1.jpg",
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "silver diaphragm", "d-450-cap", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-450 CAP professional compression drivers, tweeter maintenance, PA system repair, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 0,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-450 CAP 8 OHM SILVER | Global Speaker Parts",
        description: "Premium silver-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil for D-450 CAP drivers."
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
      name: "CCAW D-450 CAP 8 OHM SILVER",
      price: 5.50,
      stock: 900,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Silver Anodized Titanium / CCAW Voice Coil",
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

  // Insert product gallery image records
  console.log("Inserting product gallery images...");
  const imageUrls = [
    "/diaphragm-ccaw-d450-cap-silver-1.jpg",
    "/diaphragm-ccaw-d450-cap-silver-2.jpg"
  ];

  for (let i = 0; i < imageUrls.length; i++) {
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: imageUrls[i],
        alt_text: `${productName} View ${i + 1}`,
        order_index: i
      });

    if (imageError) {
      console.error(`Error inserting image ${imageUrls[i]}:`, imageError);
    } else {
      console.log(`Gallery image ${i + 1} inserted successfully!`);
    }
  }

  console.log("D-450 CAP Silver Diaphragm product listing fully complete!");
}

main().catch(console.error);
