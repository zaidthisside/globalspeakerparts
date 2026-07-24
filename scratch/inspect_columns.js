const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qvjcheciijcwafiqaigx.supabase.co";
const supabaseAnonKey = "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('variants').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Raw variant columns:", Object.keys(data[0] || {}));
}

main().catch(console.error);
