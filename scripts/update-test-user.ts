import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.local' });

async function updateTestUser() {
  try {
    console.log('Updating test user...');
    
    const email = 'chunghawtan@gmail.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update existing user with password
    const { rows } = await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE email = ${email}
      RETURNING *
    `;
    
    if (rows.length > 0) {
      console.log('✅ Test user updated successfully!');
      console.log('Email: chunghawtan@gmail.com');
      console.log('Password: test123');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating test user:', error);
    throw error;
  }
}

// Run the setup
updateTestUser()
  .then(() => {
    console.log('🎉 Test user update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test user update failed:', error);
    process.exit(1);
  });
