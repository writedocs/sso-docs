import { createClient } from "@supabase/supabase-js";
import { projectID } from "../plan.js";

const createSupabaseClient = () => {
  if (!projectID) {
    return null;
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
};

export default createSupabaseClient();
