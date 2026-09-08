import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xsozhazoqdlaapajkfdm.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzb3poYXpvcWRsYWFwYWprZmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI4OTUsImV4cCI6MjEwMTA0ODg5NX0.GHYGeHr5nZtApkwKCIzdMvBDR4nL2yioKCFceqsU04Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
