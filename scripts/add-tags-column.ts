#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function addTagsColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Adding "tags" column to actions table...');
    
    // Add the tags column
    await client.query(`
      ALTER TABLE actions 
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[]
    `);
    
    console.log('✅ "tags" column added successfully!');
    
    // Update existing actions with default tags based on category
    console.log('Updating existing actions with default tags...');
    
    const { rows } = await client.query('SELECT id, title, category FROM actions WHERE array_length(tags, 1) IS NULL');
    
    for (const row of rows) {
      let tags: string[] = [];
      switch (row.category) {
        case 'Soothe':
          tags = ['indoor', 'breathing', 'calm', 'mindfulness'];
          break;
        case 'Connect':
          tags = ['indoor', 'stretching', 'movement', 'tension_release'];
          break;
        case 'Nourish':
          tags = ['indoor', 'self_care', 'health', 'mindfulness'];
          break;
        case 'Reset':
          tags = ['indoor', 'observation', 'micro_break', 'focus'];
          break;
        default:
          tags = ['indoor', 'micro', 'wellness'];
      }
      
      await client.query('UPDATE actions SET tags = $1 WHERE id = $2', [tags, row.id]);
    }
    
    console.log(`✅ Updated ${rows.length} existing actions with default tags`);
    
  } catch (error) {
    console.error('❌ Error adding tags column:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
addTagsColumn()
  .then(() => {
    console.log('🎉 Tags column setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Tags column setup failed:', error);
    process.exit(1);
  });
