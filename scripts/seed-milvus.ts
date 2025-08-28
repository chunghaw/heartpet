#!/usr/bin/env node

import { sql } from '@vercel/postgres';
import { ensureActionsCollection, upsertActionVector } from '../src/lib/milvus';

async function seedMilvus() {
  console.log('🚀 Seeding Milvus with action vectors...');

  try {
    // Ensure collection exists
    await ensureActionsCollection();

    // Get actions from Postgres
    const { rows } = await sql`
      SELECT id as action_id, category, embedding 
      FROM actions 
      WHERE embedding IS NOT NULL
    `;

    if (rows.length === 0) {
      console.log('❌ No actions with embeddings found in Postgres');
      console.log('💡 Run "npm run setup-db" first to seed the database');
      return;
    }

    // Prepare data for Milvus
    const vectors = rows.map((row: any) => ({
      action_id: row.action_id,
      category: row.category,
      embedding: Array.isArray(row.embedding) ? row.embedding : JSON.parse(row.embedding)
    }));

    // Upsert to Milvus
    await upsertActionVector(vectors);

    console.log(`🎉 Successfully upserted ${vectors.length} vectors to Milvus`);
  } catch (error) {
    console.error('❌ Failed to seed Milvus:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedMilvus();
}
