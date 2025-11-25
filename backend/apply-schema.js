const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySchema() {
  try {
    console.log('Connecting to Supabase...');

    // Test connection
    const { error } = await supabase.from('roles').select('count').limit(1);
    if (error) {
      console.log('Database schema not applied yet. Please apply the following SQL in the Supabase SQL editor:');
      const schemaPath = path.join(__dirname, '..', 'database_schema_complete.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      console.log('\n' + '='.repeat(50));
      console.log(sql);
      console.log('='.repeat(50));
      console.log('\nAfter applying the SQL, run this script again to verify.');
    } else {
      console.log('Schema appears to be already applied.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applySchema();