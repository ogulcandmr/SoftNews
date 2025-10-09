// Test kullanıcısı oluştur
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://eilimagdfmkgbvowjtdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbGltYWdkZm1rZ2J2b3dqdGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjYwMTgsImV4cCI6MjA3NTYwMjAxOH0.Hgp6ysGtSjJ95SCxFOrleS1JI7hO1oqbEPaH0rEn-z4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
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
      if (error.code === '23505') {
        console.log('User already exists, updating...');
        
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            password: hashedPassword,
            name: 'Öğülcan Demir',
            avatar: 'https://ui-avatars.com/api/?name=Öğülcan+Demir&background=random&color=fff&size=200'
          })
          .eq('email', 'ogulcandmr96@gmail.com')
          .select();
        
        if (updateError) {
          console.error('Update error:', updateError);
        } else {
          console.log('✅ User updated successfully!');
          console.log('Updated user:', updateData);
        }
      }
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
