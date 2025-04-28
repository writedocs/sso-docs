import { createClient } from "@supabase/supabase-js";

// Support both REACT_APP_ prefix and non-prefixed env vars
const supabaseUrl =
	process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
	process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
