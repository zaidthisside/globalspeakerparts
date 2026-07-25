const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Fetching all products...");
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, seo_meta');

  if (fetchError) {
    console.error("Error fetching products:", fetchError);
    return;
  }

  console.log(`Fetched ${products.length} products. Updating seo_meta.hide_price to true...`);

  let successCount = 0;
  for (const product of products) {
    const currentMeta = product.seo_meta || {};
    const updatedMeta = {
      ...currentMeta,
      hide_price: true
    };

    const { error: updateError } = await supabase
      .from('products')
      .update({ seo_meta: updatedMeta })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Error updating product ${product.name} (ID: ${product.id}):`, updateError);
    } else {
      successCount++;
    }
  }

  console.log(`Successfully set hide_price to true for ${successCount}/${products.length} products!`);
}

main().catch(console.error);
