const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const categoryId = '4ace09b9-4486-4de4-9fb5-b3c6def3206d'; // Speaker Edge & Ports category
  
  // 1. Insert product
  const productData = {
    category_id: categoryId,
    name: '12" Speaker Foam Edges',
    slug: '12-inch-speaker-foam-edges',
    short_desc: 'Premium high-density EVA foam edge surrounds and gaskets for 12-inch professional subwoofers and woofers. Sold in sets of 4 or 8 segments for easy cabinet assembly.',
    long_desc: 'Our 12-inch B2B speaker foam edge segments are manufactured using precision die-cut high-density EVA foam. Specially designed to provide a perfect airtight seal and damp basket resonances in professional woofers, car audio subwoofers, and PA cabinets.',
    featured_image: '/products/12-speaker-foam-edges.jpg',
    is_hidden: false,
    is_featured: false,
    seo_meta: {
      title: '12" Speaker Foam Edges & Gaskets | B2B Manufacturer',
      hide_price: true,
      description: 'Wholesale 12-inch speaker foam edges, surrounds, and EVA gaskets. Custom sizes and density options available.'
    },
    tags: ['foam edges', 'gaskets', '12 inch speaker', 'B2B speaker parts'],
    applications: 'Subwoofers, DJ speakers, PA cabinets, custom woofer rebuilds.',
    moq: '1,000 sets',
    sort_order: 1
  };

  // Check if product already exists
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productData.slug)
    .single();

  let productId;
  if (existingProduct) {
    productId = existingProduct.id;
    console.log('Product already exists with ID:', productId);
  } else {
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error('Error inserting product:', productError);
      return;
    }
    productId = newProduct.id;
    console.log('Inserted new product successfully. ID:', productId);
  }

  // 2. Insert variants
  const variants = [
    {
      product_id: productId,
      name: '12" Foam Gasket - 4-segment Set',
      specs: {
        'Outer Diameter': '12.0 inches (305mm)',
        'Width': '0.75 inches (19mm)',
        'Thickness': '0.25 inches (6.35mm)',
        'Material': 'High-Density Charcoal EVA Foam',
        'Package': '4 segments (Full ring)',
        'MOQ': '1,000 sets'
      },
      stock: 5000,
      price: 0.85,
      is_active: true,
      sort_order: 0
    },
    {
      product_id: productId,
      name: '12" Foam Gasket - 8-segment Set',
      specs: {
        'Outer Diameter': '12.0 inches (305mm)',
        'Width': '0.75 inches (19mm)',
        'Thickness': '0.25 inches (6.35mm)',
        'Material': 'High-Density Charcoal EVA Foam',
        'Package': '8 segments (Double ring)',
        'MOQ': '1,000 sets'
      },
      stock: 3000,
      price: 1.50,
      is_active: true,
      sort_order: 1
    }
  ];

  for (const variant of variants) {
    const { data: existingVariant } = await supabase
      .from('variants')
      .select('id')
      .eq('product_id', productId)
      .eq('name', variant.name)
      .single();

    if (existingVariant) {
      console.log(`Variant ${variant.name} already exists. Skipping.`);
    } else {
      const { error: variantError } = await supabase
        .from('variants')
        .insert(variant);

      if (variantError) {
        console.error(`Error inserting variant ${variant.name}:`, variantError);
      } else {
        console.log(`Inserted variant ${variant.name} successfully.`);
      }
    }
  }

  // 3. Link image in product_images
  const { data: existingImg } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .eq('url', productData.featured_image)
    .single();

  if (!existingImg) {
    const { error: imgError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: productData.featured_image,
        alt_text: '12" Speaker Foam Edges',
        order_index: 0
      });

    if (imgError) {
      console.error('Error linking product image:', imgError);
    } else {
      console.log('Linked product image successfully.');
    }
  }
}

run();
