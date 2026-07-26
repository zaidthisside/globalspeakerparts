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
  const oldSlug = 'magnets';
  const newName = 'Speaker Edge & Ports';
  const newSlug = 'speaker-edge-ports';

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: newName,
      slug: newSlug,
      seo_meta: {
        title: "Speaker Edge & Ports",
        description: "Premium paper ports, cardboard tubes, and EVA speaker gaskets designed for acoustic enclosures."
      }
    })
    .eq('slug', oldSlug)
    .select();

  if (error) {
    console.error("Error updating category in Supabase:", error);
    return;
  }

  console.log("Updated category successfully:", JSON.stringify(data, null, 2));
}

run();
