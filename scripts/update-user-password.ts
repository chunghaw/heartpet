import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.local' });

async function updateUserPassword() {
  try {
    console.log('Updating user password...');
    
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
      console.log('✅ User password updated successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating user password:', error);
    throw error;
  }
}

updateUserPassword()
  .then(() => {
    console.log('🎉 Password update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Password update failed:', error);
    process.exit(1);
  });
