#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function addEmbeddings() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Adding embeddings to existing actions...');
    
    // Get all actions without embeddings
    const { rows } = await client.query(`
      SELECT id, title, steps, category, why, tags 
      FROM actions 
      WHERE embedding IS NULL
    `);
    
    console.log(`Found ${rows.length} actions without embeddings`);
    
    for (const action of rows) {
      console.log(`Processing: ${action.title}`);
      
      // Generate embedding for the action
      const textForEmbedding = `${action.title}\n${action.steps.join(' ')}\nwhy:${action.why}\ncategory:${action.category}\ntags:${action.tags.join(',')}`;
      
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textForEmbedding
      });
      
      const embeddingArray = embedding.data[0].embedding;
      
      // Update the action with embedding (store as JSON)
      await client.query(`
        UPDATE actions 
        SET embedding = $1 
        WHERE id = $2
      `, [JSON.stringify(embeddingArray), action.id]);
      
      console.log(`✅ Added embedding to: ${action.title}`);
    }
    
    console.log('🎉 All embeddings added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding embeddings:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
addEmbeddings()
  .then(() => {
    console.log('🎉 Embedding addition complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Embedding addition failed:', error);
    process.exit(1);
  });
