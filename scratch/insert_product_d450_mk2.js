const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const categoryId = "07164bc4-107d-4c5a-b2bb-7dce866b0db8"; // Diaphragms Category ID
  const productName = "SPEAKER DIAPHRAGM CCAW D-450 8 OHM MK2";
  const productSlug = "speaker-diaphragm-ccaw-d-450-8-ohm-mk2";
  
  console.log(`Inserting product "${productName}" into Supabase...`);
  
  // 1. Delete if already exists to avoid unique constraint error
  await supabase.from('products').delete().eq('slug', productSlug);

  // 2. Insert product
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      category_id: categoryId,
      name: productName,
      slug: productSlug,
      short_desc: "Premium high-performance replacement speaker diaphragm featuring an anodized blue titanium dome and heavy-duty CCAW (Copper Clad Aluminum Wire) voice coil for D-450 MK2 drivers.",
      long_desc: "This premium B2B replacement speaker diaphragm features a custom blue-anodized dome and frame assembly tailored for D-450 MK2 professional compression drivers. Wound with high-temperature Copper Clad Aluminum Wire (CCAW) on a stable Kapton former, it provides clean, precise high-frequency reproduction with superior power limits. Ideal for professional sound reinforcement and wholesale parts distribution.",
      featured_image: "/diaphragm-ccaw-d450-mk2-1.jpg",
      is_hidden: false,
      is_featured: true,
      tags: ["diaphragms", "ccaw", "compression drivers", "8 ohm", "blue diaphragm", "d-450-mk2", "speaker diaphragm"],
      applications: "Replacement diaphragm for D-450 MK2 professional compression drivers, tweeter maintenance, PA system repair, and wholesale audio component distribution.",
      moq: "100 units",
      sort_order: 3,
      seo_meta: {
        title: "SPEAKER DIAPHRAGM CCAW D-450 8 OHM MK2 | Global Speaker Parts",
        description: "Premium blue-anodized replacement speaker diaphragm featuring a high-temperature CCAW voice coil for D-450 MK2 drivers."
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

  // 3. Insert default variant
  console.log("Inserting default variant...");
  const { data: variantData, error: variantError } = await supabase
    .from('variants')
    .insert({
      product_id: productId,
      name: "CCAW D-450 8 OHM MK2",
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

  // 4. Insert product gallery image records
  console.log("Inserting product gallery images...");
  const imageUrls = [
    "/diaphragm-ccaw-d450-mk2-1.jpg",
    "/diaphragm-ccaw-d450-mk2-2.jpg"
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

  console.log("D-450 MK2 Diaphragm product listing fully complete!");
}

main().catch(console.error);
