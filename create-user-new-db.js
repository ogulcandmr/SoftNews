// Yeni Supabase projesi için test kullanıcısı oluştur
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// YENİ SUPABASE BİLGİLERİNİZİ BURAYA YAZIN
const supabaseUrl = 'https://gordevxdjsinvsxqysru.supabase.co'; // Buraya yeni URL'nizi yazın
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcmRldnhkanNpbnZzeHF5c3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjYxMDgsImV4cCI6MjA3NTYwMjEwOH0.zw9DKCcVn_7sbrvTGNZ14bhfohPhi2L2Mk3NoOIZ0v8'; // Buraya yeni key'inizi yazın

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('Creating test user in new database...');
    
    const hashedPassword = await bcrypt.hash('1712Sima.*', 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'ogulcandmr96@gmail.com',
        password: hashedPassword,
        name: 'Öğülcan Demir',
        avatar: 'https://ui-avatars.com/api/?name=Öğülcan+Demir&background=random&color=fff&size=200',
        provider: 'local',
        created_at: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'tr'
        }
      }])
      .select();
    
    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('✅ User created successfully!');
      console.log('Created user:', data);
    }
    
    console.log('\nTest credentials:');
    console.log('Email: ogulcandmr96@gmail.com');
    console.log('Password: 1712Sima.*');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
