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
  const categoryId = "2f66de45-ad95-4aba-9b3f-db9de5980818"; // Speaker Surrounds

  const products = [
    {
      name: "SPEAKER FOAM SURROUND ID-25 MM, OD-49 MM",
      slug: "speaker-foam-surround-id-25-mm-od-49-mm",
      srcImage: "media__1784954114977.jpg",
      dstImage: "surround-25-49.jpg",
      shortDesc: "Premium speaker foam surround replacement edge featuring a 49 mm outer diameter and 25 mm inner diameter.",
      longDesc: "This premium speaker foam surround is engineered for precision repairs of small midranges, tweeters, and full-range speakers. Crafted from durable, highly flexible black foam, it provides excellent excursion compliance and resonance damping to restore original sound quality. Fits small speaker drivers requiring precise ID-25mm and OD-49mm alignment.",
      tags: ["speaker surrounds", "foam surround", "speaker repair", "small speaker", "speaker edge"],
      applications: "Tweeter and midrange driver edge restoration, small woofer surround repairs, professional audio re-coning.",
      moq: "100 units",
      variantName: "Foam Surround 25-49",
      price: 0.80,
      stock: 3000,
      specs: {
        "Material": "Flexible Black Textured Foam",
        "Outer Diameter (OD)": "49 mm",
        "Inner Diameter (ID)": "25 mm",
        "Roll Diameter": "44 mm",
        "Piston Diameter": "32 mm"
      }
    },
    {
      name: "8\" FOAM SURROUND BLUE ID-136 MM, OD-193 MM",
      slug: "8-foam-surround-blue-id-136-mm-od-193-mm",
      srcImage: "media__1784954114987.jpg",
      dstImage: "surround-8-blue.jpg",
      shortDesc: "Premium 8-inch blue foam surround replacement edge featuring a 193 mm outer diameter and 136 mm inner diameter.",
      longDesc: "This premium 8-inch speaker foam surround features a vibrant blue color and is designed for high-performance woofer repairs. Engineered from flexible and durable foam, it provides smooth, controlled cone excursion and excellent compliance. Perfect for restoring classic and modern 8-inch drivers with precise alignment dimensions.",
      tags: ["speaker surrounds", "foam surround", "speaker repair", "8 inch", "blue surround"],
      applications: "Woofer edge restoration, blue foam surround repairs, custom audio builds, professional sound re-coning.",
      moq: "100 units",
      variantName: "Blue Foam 8\"",
      price: 1.30,
      stock: 1500,
      specs: {
        "Material": "Flexible Blue Textured Foam",
        "Outer Diameter (OD)": "193 mm",
        "Inner Diameter (ID)": "136 mm",
        "Roll Diameter": "178 mm",
        "Piston Diameter": "149 mm"
      }
    },
    {
      name: "8\" FOAM SURROUND BLACK ID-136 MM, OD-193 MM",
      slug: "8-foam-surround-black-id-136-mm-od-193-mm",
      srcImage: "media__1784954114999.jpg",
      dstImage: "surround-8-black.jpg",
      shortDesc: "Premium 8-inch black foam surround replacement edge featuring a 193 mm outer diameter and 136 mm inner diameter.",
      longDesc: "This premium 8-inch speaker foam surround is engineered from flexible and durable black foam, providing smooth, controlled cone excursion and excellent compliance for woofer repairs. Perfect for restoring classic and modern 8-inch drivers with precise alignment dimensions.",
      tags: ["speaker surrounds", "foam surround", "speaker repair", "8 inch", "speaker edge"],
      applications: "Standard 8-inch woofer edge restoration, black foam surround repairs, professional audio re-coning.",
      moq: "100 units",
      variantName: "Black Foam 8\"",
      price: 1.20,
      stock: 2000,
      specs: {
        "Material": "Flexible Black Textured Foam",
        "Outer Diameter (OD)": "193 mm",
        "Inner Diameter (ID)": "136 mm",
        "Roll Diameter": "178 mm",
        "Piston Diameter": "149 mm"
      }
    }
  ];

  for (const p of products) {
    const srcPath = path.join(artifactsDir, p.srcImage);
    const dstPath = path.join(publicDir, p.dstImage);

    console.log(`Processing and optimizing image ${srcPath} -> ${dstPath}...`);
    await sharp(srcPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(dstPath);
    console.log("Image optimized and saved!");

    console.log(`Inserting product "${p.name}" into Supabase...`);
    // Delete existing to avoid unique constraint issues
    await supabase.from('products').delete().eq('slug', p.slug);

    // Insert product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        category_id: categoryId,
        name: p.name,
        slug: p.slug,
        short_desc: p.shortDesc,
        long_desc: p.longDesc,
        featured_image: `/${p.dstImage}`,
        is_hidden: false,
        is_featured: false,
        tags: p.tags,
        applications: p.applications,
        moq: p.moq,
        sort_order: 0,
        seo_meta: {
          title: `${p.name} | Global Speaker Parts`,
          description: p.shortDesc
        }
      })
      .select()
      .single();

    if (productError || !productData) {
      console.error(`Error inserting product ${p.name}:`, productError);
      continue;
    }

    const productId = productData.id;
    console.log(`Product inserted successfully! ID: ${productId}`);

    // Insert variant
    console.log(`Inserting default variant for ${p.name}...`);
    const { data: variantData, error: variantError } = await supabase
      .from('variants')
      .insert({
        product_id: productId,
        name: p.variantName,
        price: p.price,
        stock: p.stock,
        is_active: true,
        sort_order: 1,
        specs: p.specs
      })
      .select()
      .single();

    if (variantError) {
      console.error(`Error inserting variant for ${p.name}:`, variantError);
      continue;
    }
    console.log(`Variant inserted successfully! ID: ${variantData.id}`);

    // Insert gallery image record
    console.log(`Inserting gallery image for ${p.name}...`);
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: `/${p.dstImage}`,
        alt_text: p.name,
        order_index: 0
      });

    if (imageError) {
      console.error(`Error inserting product image for ${p.name}:`, imageError);
      continue;
    }
    console.log(`Product "${p.name}" fully listed!`);
  }
}

main().catch(console.error);
