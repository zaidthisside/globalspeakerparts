import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvjcheciijcwafiqaigx.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_aswir1JOSTt4rvIYevngGg_qttBBNZx";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
