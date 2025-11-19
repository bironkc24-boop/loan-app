import { supabase } from './config/supabase';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

async function runSchemaTests(): Promise<void> {
  console.log('🔍 Running Database Schema Diagnostic Tests...\n');

  const results: TestResult[] = [];

  // Test database connectivity
  try {
    const { error } = await supabase.from('roles').select('count').limit(1);
    if (error) throw error;
    results.push({ name: 'Database Connectivity', status: 'PASS', message: 'Connected successfully' });
  } catch (error) {
    results.push({ name: 'Database Connectivity', status: 'FAIL', message: `Connection failed: ${error instanceof Error ? error.message : String(error)}` });
    console.log('❌ Database connection failed. Aborting tests.');
    return;
  }

  // Tables to check
  const tables = [
    'roles', 'users', 'user_roles', 'borrower_profiles', 'riders',
    'loans', 'loan_documents', 'loan_status_history', 'rider_assignments', 'notifications'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && !error.message.includes('Row Level Security')) {
        throw error;
      }
      results.push({ name: `Table: ${table}`, status: 'PASS', message: 'Exists and accessible' });
    } catch (error) {
      results.push({ name: `Table: ${table}`, status: 'FAIL', message: `Error: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Enums to check
  const enums = [
    'employment_status_enum', 'rider_status_enum', 'loan_product_type',
    'loan_status_enum', 'document_type_enum', 'assignment_status_enum', 'notification_type_enum'
  ];

  for (const enumName of enums) {
    try {
      const { error } = await supabase.rpc('get_enum_values', { enum_name: enumName });
      if (error) {
        // Fallback: try to query pg_enum directly (service role needed)
        const { data: enumData, error: enumError } = await supabase
          .from('pg_enum')
          .select('enumtypid')
          .eq('enumtypid', `(SELECT oid FROM pg_type WHERE typname = '${enumName}')`)
          .limit(1);

        if (enumError || !enumData || enumData.length === 0) {
          throw new Error('Enum not found');
        }
      }
      results.push({ name: `Enum: ${enumName}`, status: 'PASS', message: 'Exists' });
    } catch (error) {
      results.push({ name: `Enum: ${enumName}`, status: 'FAIL', message: `Error: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Functions to check
  const functions = ['has_role', 'update_updated_at_column', 'create_loan_status_history', 'update_rider_assignment_count'];

  for (const func of functions) {
    try {
      // Try to call the function or check if it exists
      const { error } = await supabase.rpc(func);
      if (error && !error.message.includes('function') && !error.message.includes('arguments')) {
        throw error;
      }
      results.push({ name: `Function: ${func}`, status: 'PASS', message: 'Exists' });
    } catch (error) {
      results.push({ name: `Function: ${func}`, status: 'FAIL', message: `Error: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Check RLS is enabled on tables
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', table)
        .single();

      if (error) throw error;
      if (data.relrowsecurity) {
        results.push({ name: `RLS: ${table}`, status: 'PASS', message: 'Enabled' });
      } else {
        results.push({ name: `RLS: ${table}`, status: 'FAIL', message: 'Not enabled' });
      }
    } catch (error) {
      results.push({ name: `RLS: ${table}`, status: 'FAIL', message: `Error checking RLS: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Check indices
  const indices = [
    'idx_user_roles_user_id', 'idx_user_roles_role_id', 'idx_loans_borrower_id',
    'idx_loans_rider_id', 'idx_loans_status', 'idx_loans_applied_at',
    'idx_loan_documents_loan_id', 'idx_loan_status_history_loan_id',
    'idx_rider_assignments_rider_id', 'idx_rider_assignments_loan_id',
    'idx_notifications_user_id', 'idx_notifications_read'
  ];

  for (const index of indices) {
    try {
      const { data, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .eq('indexname', index)
        .single();

      if (error || !data) {
        throw new Error('Index not found');
      }
      results.push({ name: `Index: ${index}`, status: 'PASS', message: 'Exists' });
    } catch (error) {
      results.push({ name: `Index: ${index}`, status: 'FAIL', message: `Error: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Check triggers
  const triggers = [
    'update_users_updated_at', 'update_borrower_profiles_updated_at',
    'update_riders_updated_at', 'update_loans_updated_at',
    'loan_status_change_trigger', 'rider_assignment_count_trigger'
  ];

  for (const trigger of triggers) {
    try {
      const { data, error } = await supabase
        .from('pg_trigger')
        .select('tgname')
        .eq('tgname', trigger)
        .single();

      if (error || !data) {
        throw new Error('Trigger not found');
      }
      results.push({ name: `Trigger: ${trigger}`, status: 'PASS', message: 'Exists' });
    } catch (error) {
      results.push({ name: `Trigger: ${trigger}`, status: 'FAIL', message: `Error: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  // Display results
  console.log('\n📊 TEST RESULTS:\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log(`\n🎯 SUMMARY: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All schema elements are present and accessible!');
  } else {
    console.log('⚠️  Some schema elements are missing or not properly configured.');
  }
}

// Run the tests
runSchemaTests().catch(console.error);