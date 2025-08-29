#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function removeDeepBreaths() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    // Check if the action exists
    const checkResult = await client.query(
      'SELECT id, title FROM actions WHERE title = $1',
      ['Take 3 deep breaths']
    );
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Action "Take 3 deep breaths" not found in database');
      return;
    }
    
    console.log(`🗑️ Found action: ${checkResult.rows[0].title} (ID: ${checkResult.rows[0].id})`);
    
    // Remove the action
    const deleteResult = await client.query(
      'DELETE FROM actions WHERE title = $1',
      ['Take 3 deep breaths']
    );
    
    console.log(`✅ Successfully removed ${deleteResult.rowCount} action(s)`);
    
    // Show updated count
    const countResult = await client.query('SELECT COUNT(*) FROM actions');
    console.log(`📊 Total actions remaining: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error removing action:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
removeDeepBreaths()
  .then(() => {
    console.log('\n🎉 Action removal complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Action removal failed:', error);
    process.exit(1);
  });
