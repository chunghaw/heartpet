#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkTableStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Checking actions table structure...');
    
    // Check the table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'actions'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Actions table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if table has any data
    const countResult = await client.query('SELECT COUNT(*) FROM actions');
    console.log(`📊 Actions table has ${countResult.rows[0].count} rows`);
    
    // Check sample data if any exists
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await client.query('SELECT * FROM actions LIMIT 1');
      console.log('📝 Sample action data:');
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the check
checkTableStructure()
  .then(() => {
    console.log('🎉 Table structure check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Table structure check failed:', error);
    process.exit(1);
  });
