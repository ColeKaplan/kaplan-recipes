import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// If the env var is a relative path (e.g. "/supabase"), resolve it against the
// current page origin so the Supabase client gets a full URL without hardcoding an IP.
const rawUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseUrl = rawUrl.startsWith('/') ? `${window.location.origin}${rawUrl}` : rawUrl;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
