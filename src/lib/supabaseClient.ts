import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pfpuemiotlraptfaohcq.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcHVlbWlvdGxyYXB0ZmFvaGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjM3NjAsImV4cCI6MjEwNDQzOTc2MH0.IjQhzZ9nUsm6HuW4ft2IAZSf0sO2xUMejCtT8Uz6LAA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
