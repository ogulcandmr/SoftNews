// Database connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eilimagdfmkgbvowjtdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGltYWdkZm1rZ2J2b3dqdGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjYwMTgsImV4cCI6MjA3NTYwMjAxOH0.Hgp6ysGtSjJ95SCxFOrleS1JI7hO1oqbEPaH0rEn-z4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      console.log('\n❌ Database connection failed!');
      console.log('Please check:');
      console.log('1. Supabase project is active');
      console.log('2. Database schema is created');
      console.log('3. RLS policies are set correctly');
    } else {
      console.log('✅ Database connection successful!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testDatabase();
