// Test kullanıcısı oluşturmak için bu script'i çalıştırın
// Node.js ile: node test-user.js

const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('1714Olci.', 10);
    
    console.log('Test kullanıcısı için hashlenmiş şifre:');
    console.log(hashedPassword);
    console.log('\nBu şifreyi Supabase veritabanına ekleyin:');
    console.log('Email: ogulcandmr96@gmail.com');
    console.log('Password: 1714Olci.');
    console.log('Hashed Password:', hashedPassword);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
