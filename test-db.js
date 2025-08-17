const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://sfonesgsabtvykzmpaot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmb25lc2dzYWJ0dnlrem1wYW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk0NDkzOSwiZXhwIjoyMDcwNTIwOTM5fQ.PJZEojqY9a8-TZEZycNaw2ZJeQz-VngIYkz_rOZC_Ww'
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
    } else {
      console.log('✅ Database connected successfully!');
      console.log('Tenants found:', data.length);
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();