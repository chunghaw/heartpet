import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.local' });

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const email = 'chunghawtan@gmail.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert test user
    await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${email}, ${email}, 'Chung Haw Tan', ${hashedPassword})
      ON CONFLICT (id) DO UPDATE SET 
        password_hash = ${hashedPassword},
        name = 'Chung Haw Tan'
    `;
    
    console.log('✅ Test user created successfully!');
    console.log('Email: chunghawtan@gmail.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Run the setup
createTestUser()
  .then(() => {
    console.log('🎉 Test user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test user setup failed:', error);
    process.exit(1);
  });
