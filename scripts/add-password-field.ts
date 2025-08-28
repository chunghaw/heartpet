import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function addPasswordField() {
  try {
    console.log('Adding password_hash field to users table...');
    
    // Add password_hash column if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `;
    
    console.log('✅ Password field added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding password field:', error);
    throw error;
  }
}

// Run the setup
addPasswordField()
  .then(() => {
    console.log('🎉 Database update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database update failed:', error);
    process.exit(1);
  });
