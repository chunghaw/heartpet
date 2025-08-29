#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testSingleAction() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Testing single action insertion...');
    
    // Test with a simple action
    const result = await client.query(`
      INSERT INTO actions (title, steps, seconds, category, why, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (title) DO UPDATE SET
        steps = EXCLUDED.steps,
        seconds = EXCLUDED.seconds,
        category = EXCLUDED.category,
        why = EXCLUDED.why,
        tags = EXCLUDED.tags
      RETURNING *
    `, [
      'Test Action',
      ['Step 1', 'Step 2', 'Step 3'],
      60,
      'Test',
      'This is a test action',
      ['test', 'simple']
    ]);
    
    console.log('✅ Action inserted successfully:', result.rows[0]);
    
    // Check the table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'actions'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Actions table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error testing action insertion:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the test
testSingleAction()
  .then(() => {
    console.log('🎉 Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
