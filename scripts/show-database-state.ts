#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function showDatabaseState() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    // Show table structure
    console.log('\n📋 ACTIONS TABLE STRUCTURE:');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'actions'
      ORDER BY ordinal_position
    `);
    
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Count total actions
    const countResult = await client.query('SELECT COUNT(*) FROM actions');
    console.log(`\n📊 TOTAL ACTIONS: ${countResult.rows[0].count}`);
    
    // Show all actions with details
    console.log('\n🎯 ALL ACTIONS IN DATABASE:');
    const { rows: actions } = await client.query(`
      SELECT id, title, steps, seconds, category, tags, why, 
             CASE WHEN embedding IS NOT NULL THEN 'YES' ELSE 'NO' END as has_embedding
      FROM actions 
      ORDER BY title
    `);
    
    actions.forEach((action, index) => {
      console.log(`\n${index + 1}. ${action.title}`);
      console.log(`   ID: ${action.id}`);
      console.log(`   Category: ${action.category}`);
      console.log(`   Duration: ${action.seconds}s`);
      console.log(`   Tags: ${action.tags ? action.tags.join(', ') : 'None'}`);
      console.log(`   Steps: ${Array.isArray(action.steps) ? action.steps.length : 'JSON'} steps`);
      console.log(`   Why: ${action.why.substring(0, 80)}...`);
      console.log(`   Embedding: ${action.has_embedding}`);
    });
    
    // Show executions table (for novelty tracking)
    console.log('\n📈 EXECUTIONS TABLE (for novelty tracking):');
    const executionsCount = await client.query('SELECT COUNT(*) FROM executions');
    console.log(`   Total executions: ${executionsCount.rows[0].count}`);
    
    if (parseInt(executionsCount.rows[0].count) > 0) {
      const recentExecutions = await client.query(`
        SELECT action_id, COUNT(*) as times_done, MAX(created_at) as last_done
        FROM executions 
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY action_id
        ORDER BY times_done DESC
      `);
      
      console.log('   Recent executions (last 7 days):');
      recentExecutions.rows.forEach(exec => {
        console.log(`     Action ID: ${exec.action_id} - Done ${exec.times_done} times (last: ${exec.last_done})`);
      });
    }
    
    // Show category distribution
    console.log('\n📊 CATEGORY DISTRIBUTION:');
    const categoryStats = await client.query(`
      SELECT category, COUNT(*) as count
      FROM actions 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    categoryStats.rows.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} actions`);
    });
    
  } catch (error) {
    console.error('❌ Error showing database state:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
showDatabaseState()
  .then(() => {
    console.log('\n🎉 Database state check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database state check failed:', error);
    process.exit(1);
  });
