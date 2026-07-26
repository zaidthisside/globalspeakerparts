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
  
  const products = [
    {
      name: '8" Speaker Foam Edges',
      slug: '8-inch-speaker-foam-edges',
      short_desc: 'Premium high-density EVA foam edge surrounds and gaskets for 8-inch speaker cabinets. Custom widths and thicknesses available for B2B wholesale orders.',
      long_desc: 'Our 8-inch B2B speaker foam edge segments are manufactured using precision die-cut high-density EVA foam. Specially designed to provide a perfect airtight seal and damp basket resonances in 8-inch speaker configurations.',
      featured_image: '/products/speaker-foam-edges.jpg',
      tags: ['foam edges', 'gaskets', '8 inch speaker', 'B2B speaker parts'],
      applications: 'Bookshelf speakers, home audio cabinets, custom 8-inch woofers.',
      moq: '1,000 sets',
      sort_order: 2,
      variants: [
        {
          name: '8" Foam Gasket - 4-segment Set',
          specs: {
            'Outer Diameter': '8.0 inches (203mm)',
            'Width': '0.5 inches (12.7mm)',
            'Thickness': '0.20 inches (5mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '4 segments (Full ring)',
            'MOQ': '1,000 sets'
          },
          stock: 5000,
          price: 0.55
        },
        {
          name: '8" Foam Gasket - 8-segment Set',
          specs: {
            'Outer Diameter': '8.0 inches (203mm)',
            'Width': '0.5 inches (12.7mm)',
            'Thickness': '0.20 inches (5mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '8 segments (Double ring)',
            'MOQ': '1,000 sets'
          },
          stock: 3000,
          price: 1.00
        }
      ]
    },
    {
      name: '15" Speaker Foam Edges',
      slug: '15-inch-speaker-foam-edges',
      short_desc: 'Premium high-density EVA foam edge surrounds and gaskets for 15-inch high-performance subwoofers and DJ speakers.',
      long_desc: 'Our 15-inch B2B speaker foam edge segments are manufactured using precision die-cut high-density EVA foam. Designed to provide a perfect airtight seal and damp basket resonances in professional 15-inch subwoofers, DJ speakers, and PA cabinets.',
      featured_image: '/products/speaker-foam-edges.jpg',
      tags: ['foam edges', 'gaskets', '15 inch speaker', 'B2B speaker parts'],
      applications: 'Subwoofers, DJ speakers, PA cabinets, custom 15-inch woofer rebuilds.',
      moq: '1,000 sets',
      sort_order: 3,
      variants: [
        {
          name: '15" Foam Gasket - 4-segment Set',
          specs: {
            'Outer Diameter': '15.0 inches (381mm)',
            'Width': '0.85 inches (21.6mm)',
            'Thickness': '0.30 inches (7.6mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '4 segments (Full ring)',
            'MOQ': '1,000 sets'
          },
          stock: 5000,
          price: 1.10
        },
        {
          name: '15" Foam Gasket - 8-segment Set',
          specs: {
            'Outer Diameter': '15.0 inches (381mm)',
            'Width': '0.85 inches (21.6mm)',
            'Thickness': '0.30 inches (7.6mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '8 segments (Double ring)',
            'MOQ': '1,000 sets'
          },
          stock: 3000,
          price: 2.00
        }
      ]
    },
    {
      name: '18" Speaker Foam Edges',
      slug: '18-inch-speaker-foam-edges',
      short_desc: 'Heavy-duty high-density EVA foam edge surrounds and gaskets for 18-inch professional concert woofers and subwoofers.',
      long_desc: 'Our 18-inch B2B speaker foam edge segments are manufactured using precision die-cut high-density EVA foam. Built to withstand maximum excursion and provide an absolute airtight seal in 18-inch concert subwoofers and high-power PA enclosures.',
      featured_image: '/products/speaker-foam-edges.jpg',
      tags: ['foam edges', 'gaskets', '18 inch speaker', 'B2B speaker parts'],
      applications: 'Concert subwoofers, professional PA systems, high-power 18-inch transducers.',
      moq: '1,000 sets',
      sort_order: 4,
      variants: [
        {
          name: '18" Foam Gasket - 4-segment Set',
          specs: {
            'Outer Diameter': '18.0 inches (457mm)',
            'Width': '1.0 inch (25.4mm)',
            'Thickness': '0.375 inches (9.5mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '4 segments (Full ring)',
            'MOQ': '1,000 sets'
          },
          stock: 5000,
          price: 1.45
        },
        {
          name: '18" Foam Gasket - 8-segment Set',
          specs: {
            'Outer Diameter': '18.0 inches (457mm)',
            'Width': '1.0 inch (25.4mm)',
            'Thickness': '0.375 inches (9.5mm)',
            'Material': 'High-Density Charcoal EVA Foam',
            'Package': '8 segments (Double ring)',
            'MOQ': '1,000 sets'
          },
          stock: 3000,
          price: 2.70
        }
      ]
    }
  ];

  for (const prod of products) {
    // 1. Insert product
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .single();

    let productId;
    if (existingProduct) {
      productId = existingProduct.id;
      console.log(`Product ${prod.name} already exists. ID:`, productId);
    } else {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: prod.name,
          slug: prod.slug,
          short_desc: prod.short_desc,
          long_desc: prod.long_desc,
          featured_image: prod.featured_image,
          is_hidden: false,
          is_featured: false,
          seo_meta: {
            title: `${prod.name} | B2B Manufacturer`,
            hide_price: true,
            description: prod.short_desc
          },
          tags: prod.tags,
          applications: prod.applications,
          moq: prod.moq,
          sort_order: prod.sort_order
        })
        .select()
        .single();

      if (productError) {
        console.error(`Error inserting product ${prod.name}:`, productError);
        continue;
      }
      productId = newProduct.id;
      console.log(`Inserted product ${prod.name} successfully. ID:`, productId);
    }

    // 2. Insert variants
    for (const variant of prod.variants) {
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
          .insert({
            product_id: productId,
            name: variant.name,
            specs: variant.specs,
            stock: variant.stock,
            price: variant.price,
            is_active: true,
            sort_order: variant.name.includes('8-segment') ? 1 : 0
          });

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
      .eq('url', prod.featured_image)
      .single();

    if (!existingImg) {
      const { error: imgError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: prod.featured_image,
          alt_text: prod.name,
          order_index: 0
        });

      if (imgError) {
        console.error(`Error linking product image for ${prod.name}:`, imgError);
      } else {
        console.log(`Linked product image for ${prod.name} successfully.`);
      }
    }
  }
}

run();
