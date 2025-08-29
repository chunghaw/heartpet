#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { ensureActionsCollection, upsertActionVector } from '../src/lib/milvus';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function seedMilvusActions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Seeding Milvus with action vectors...');
    
    // Ensure Milvus collection exists
    await ensureActionsCollection();
    
    // Connect to Postgres
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    // Get all actions with embeddings
    const { rows } = await client.query(`
      SELECT id, title, steps, category, why, tags, embedding
      FROM actions 
      WHERE embedding IS NOT NULL
    `);
    
    console.log(`Found ${rows.length} actions with embeddings`);
    
    if (rows.length === 0) {
      console.log('❌ No actions found with embeddings. Run npm run add:embeddings first.');
      return;
    }
    
    // Prepare data for Milvus
    const milvusData = rows.map(row => ({
      action_id: row.id,
      category: row.category,
      embedding: row.embedding
    }));
    
    // Upsert to Milvus
    await upsertActionVector(milvusData);
    
    console.log(`🎉 Successfully seeded ${rows.length} action vectors to Milvus!`);
    
  } catch (error) {
    console.error('❌ Failed to seed Milvus:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedMilvusActions()
  .then(() => {
    console.log('🎉 Milvus action seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Milvus action seeding failed:', error);
    process.exit(1);
  });
