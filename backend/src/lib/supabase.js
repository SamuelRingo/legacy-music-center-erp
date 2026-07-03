import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase env vars loaded:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
});

export const supabase = supabaseUrl && supabaseKey && supabaseUrl !== "https://mock.supabase.co"
  ? createClient(supabaseUrl, supabaseKey)
  : null;
