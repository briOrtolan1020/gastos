import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrllklmoapragczkyjgf.supabase.co";

const supabaseAnonKey =
  "sb_publishable_q64Hpshdlr2uY9LFE0N6iw_pyoFp1cZ";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);