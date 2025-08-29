#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function addWhyColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Adding "why" column to actions table...');
    
    // Add the why column
    await client.query(`
      ALTER TABLE actions 
      ADD COLUMN IF NOT EXISTS why TEXT
    `);
    
    console.log('✅ "why" column added successfully!');
    
    // Update existing actions with default why values
    console.log('Updating existing actions with default why values...');
    
    const { rows } = await client.query('SELECT id, title, category FROM actions WHERE why IS NULL');
    
    for (const row of rows) {
      let why = '';
      switch (row.category) {
        case 'Soothe':
          why = 'This gentle action helps calm your nervous system and bring you back to center.';
          break;
        case 'Connect':
          why = 'This movement helps you reconnect with your body and feel more grounded.';
          break;
        case 'Nourish':
          why = 'This simple act of self-care nourishes both your body and mind.';
          break;
        case 'Reset':
          why = 'This helps reset your mental state and give you a fresh perspective.';
          break;
        default:
          why = 'This micro-action is designed to support your emotional wellness.';
      }
      
      await client.query('UPDATE actions SET why = $1 WHERE id = $2', [why, row.id]);
    }
    
    console.log(`✅ Updated ${rows.length} existing actions with why values`);
    
  } catch (error) {
    console.error('❌ Error adding why column:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
addWhyColumn()
  .then(() => {
    console.log('🎉 Why column setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Why column setup failed:', error);
    process.exit(1);
  });
