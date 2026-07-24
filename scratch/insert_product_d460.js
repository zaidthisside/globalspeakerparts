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
    { src: 'media__1784890742109.jpg', dst: 'diaphragm-ccaw-d460-1.jpg' },
    { src: 'media__1784890742110.jpg', dst: 'diaphragm-ccaw-d460-2.jpg' }
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
  const productName = "SPEAKER DIAPHRAGM CCAW D-460 8 OHM";
  const productSlug = "speaker-diaphragm-ccaw-d-460-8-ohm";
  
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
      short_desc: "Premium replacement speaker diaphragm featuring an anodized blue titanium dome dome and heavy-duty CCAW (Copper Clad Aluminum Wire) voice coil for D-460 drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom blue-anodized dome and frame assembly tailored for D-460 professional compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable former, it provides clean, precise high-frequency reproduction with superior power limits. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: "/diaphragm-ccaw-d460-1.jpg",
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "blue diaphragm", "d-460", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-460 professional compression drivers, tweeter maintenance, PA system repair, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 2,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-460 8 OHM | Global Speaker Parts",
        description: "Premium blue-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil for D-460 drivers."
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
      name: "CCAW D-460 8 OHM",
      price: 5.20,
      stock: 1200,
      is_active: true,
      sort_order: 1,
      specs: {
        "Material": "Blue Anodized Titanium / CCAW Voice Coil",
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

  // Insert product gallery image records
  console.log("Inserting product gallery images...");
  const imageUrls = [
    "/diaphragm-ccaw-d460-1.jpg",
    "/diaphragm-ccaw-d460-2.jpg"
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

  console.log("D-460 Diaphragm product listing fully complete!");
}

main().catch(console.error);
