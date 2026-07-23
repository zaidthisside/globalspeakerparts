const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error("Error fetching categories:", error);
    return;
  }

  console.log("Categories in DB:");
  console.log(categories);
}

main().catch(console.error);
