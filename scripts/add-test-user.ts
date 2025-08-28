import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.local' });

async function addTestUser() {
  try {
    console.log('Adding test user to database...');
    
    const email = 'chunghawtan@gmail.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert or update test user
    const { rows } = await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${email}, ${email}, 'Chung Haw Tan', ${hashedPassword})
      ON CONFLICT (id) DO UPDATE SET 
        password_hash = ${hashedPassword},
        name = 'Chung Haw Tan'
      RETURNING *
    `;
    
    console.log('✅ Test user added successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', rows[0].id);
    
  } catch (error) {
    console.error('❌ Error adding test user:', error);
    throw error;
  }
}

addTestUser()
  .then(() => {
    console.log('🎉 Test user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test user setup failed:', error);
    process.exit(1);
  });
