// generate-hash.js
// Run this script to generate the proper bcrypt hash for your super admin password

const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'vmta123admin'; // Change this to your desired password
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Generated bcrypt hash for password:', password);
    console.log('📋 Hash:', hash);
    console.log('\n📝 Copy this SQL command to update your database:');
    console.log(`
UPDATE super_admins 
SET password_hash = '${hash}' 
WHERE email = 'admin@vmta.nl';
    `);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Hash verification:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

generateHash();