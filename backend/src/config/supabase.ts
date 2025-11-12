import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ SUPABASE CREDENTIALS MISSING ❌');
  console.error('═════════════════════════════════════════════════════════════');
  console.error('The backend requires Supabase credentials to function.');
  console.error('');
  console.error('Please add these secrets in Replit:');
  console.error('  1. SUPABASE_URL');
  console.error('  2. SUPABASE_SERVICE_KEY');
  console.error('  3. SUPABASE_ANON_KEY');
  console.error('');
  console.error('Get your credentials from: https://supabase.com');
  console.error('Go to Settings → API in your Supabase project');
  console.error('═════════════════════════════════════════════════════════════\n');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabase;
