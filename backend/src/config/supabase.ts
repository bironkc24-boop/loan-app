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

// Test database connection and schema
(async () => {
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('roles').select('count').limit(1);
    if (error) {
      console.error('❌ DATABASE CONNECTION ERROR:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('This may indicate the schema has not been applied to your Supabase database.');
      console.error('Please run the schema.sql file in your Supabase SQL editor.');
      console.error('Or check if SUPABASE_SERVICE_KEY is correct.');
    } else {
      console.log('✅ Database connection successful, schema appears to be applied.');
      console.log('Test query result:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error testing database connection:', err);
  }
})();

export default supabase;
