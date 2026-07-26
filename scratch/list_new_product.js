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
    name: 'Customisable Cardboard Speaker Ports',
    slug: 'customisable-speaker-ports',
    short_desc: 'Heavy-duty, precision-cut cardboard tubes for acoustic enclosures. Custom lengths, wall thicknesses, and inner diameters available for B2B wholesale orders.',
    long_desc: 'Our customizable B2B cardboard speaker ports are manufactured using high-density, multi-layered compressed kraft paper to prevent port resonance and structure-borne noise. Perfect for professional subwoofers, PA systems, and home theater cabinet designs.',
    featured_image: '/products/custom-speaker-port.jpg',
    is_hidden: false,
    is_featured: false,
    seo_meta: {
      title: 'Customisable Cardboard Speaker Ports | B2B Manufacturer',
      hide_price: true,
      description: 'Wholesale custom speaker ports and cardboard tubes for speaker enclosures. Manufactured to precision specifications.'
    },
    tags: ['speaker ports', 'cardboard tubes', 'enclosure ports', 'B2B speaker parts'],
    applications: 'Subwoofer enclosures, professional PA cabinets, home theater bookshelf speakers.',
    moq: '1,000 units',
    sort_order: 0
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
      name: '3-inch Cardboard Port',
      specs: {
        'Inner Diameter': '3.0 inches (76mm)',
        'Wall Thickness': '0.125 inches (3.17mm)',
        'Standard Length': '8.0 inches (203mm)',
        'Material': 'Compressed Recycled Kraft Cardboard',
        'MOQ': '1,000 units'
      },
      stock: 5000,
      price: 1.20,
      is_active: true,
      sort_order: 0
    },
    {
      product_id: productId,
      name: '4-inch Cardboard Port',
      specs: {
        'Inner Diameter': '4.0 inches (102mm)',
        'Wall Thickness': '0.125 inches (3.17mm)',
        'Standard Length': '10.0 inches (254mm)',
        'Material': 'Compressed Recycled Kraft Cardboard',
        'MOQ': '1,000 units'
      },
      stock: 3000,
      price: 1.65,
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
        alt_text: 'Customisable Cardboard Speaker Ports',
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
