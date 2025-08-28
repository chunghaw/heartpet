#!/usr/bin/env node

import { sql } from '@vercel/postgres';
import { allActions } from '../src/lib/seed-data';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return new Array(1536).fill(0); // Fallback
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up HeartPet database...');

  try {
    // Create tables
    console.log('📋 Creating tables...');
    const schema = `
      -- Users table (handled by NextAuth)
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        email_verified TIMESTAMP,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Pets table
      CREATE TABLE IF NOT EXISTS pets (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        species VARCHAR(50) NOT NULL,
        color VARCHAR(7) NOT NULL,
        size VARCHAR(10) NOT NULL,
        breed VARCHAR(100),
        stage VARCHAR(20) NOT NULL DEFAULT 'egg',
        xp INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Actions table
      CREATE TABLE IF NOT EXISTS actions (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        steps TEXT[] NOT NULL,
        seconds INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        why TEXT NOT NULL,
        embedding REAL[]
      );

      -- Check-ins table
      CREATE TABLE IF NOT EXISTS checkins (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        emoji INTEGER,
        cues JSONB,
        mood VARCHAR(20),
        energy VARCHAR(10),
        focus TEXT[],
        red_flags BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Executions table
      CREATE TABLE IF NOT EXISTS executions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        pet_id VARCHAR(255) REFERENCES pets(id) ON DELETE CASCADE,
        action_id VARCHAR(255) REFERENCES actions(id) ON DELETE CASCADE,
        seconds INTEGER NOT NULL,
        foreground_ratio REAL NOT NULL,
        hold_confirm BOOLEAN NOT NULL,
        completed BOOLEAN NOT NULL,
        helpful BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Category weights table
      CREATE TABLE IF NOT EXISTS category_weights (
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0,
        PRIMARY KEY (user_id, category)
      );

      -- Habitat props table
      CREATE TABLE IF NOT EXISTS habitat_props (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        key VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL
      );

      -- Pet props table
      CREATE TABLE IF NOT EXISTS pet_props (
        pet_id VARCHAR(255) REFERENCES pets(id) ON DELETE CASCADE,
        prop_id VARCHAR(255) REFERENCES habitat_props(id) ON DELETE CASCADE,
        owned BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (pet_id, prop_id)
      );
    `;

    await sql.query(schema);
    console.log('✅ Tables created successfully');

    // Seed actions
    console.log('🌱 Seeding actions...');
    for (const action of allActions) {
      const embedding = await generateEmbedding(`${action.title} ${action.why} ${action.steps.join(' ')}`);
      
      await sql`
        INSERT INTO actions (id, title, steps, seconds, category, why, embedding)
        VALUES (${action.id}, ${action.title}, ${JSON.stringify(action.steps)}, ${action.seconds}, ${action.category}, ${action.why}, ${JSON.stringify(embedding)})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          steps = EXCLUDED.steps,
          seconds = EXCLUDED.seconds,
          category = EXCLUDED.category,
          why = EXCLUDED.why,
          embedding = EXCLUDED.embedding
      `;
    }
    console.log(`✅ Seeded ${allActions.length} actions`);

    // Seed habitat props
    console.log('🏠 Seeding habitat props...');
    const habitatProps = [
      { key: 'lamp', label: 'Cozy Lamp' },
      { key: 'rug', label: 'Soft Rug' },
      { key: 'window', label: 'Rain Window' },
      { key: 'plant', label: 'Peaceful Plant' },
      { key: 'cushion', label: 'Comfy Cushion' },
    ];

    for (const prop of habitatProps) {
      await sql`
        INSERT INTO habitat_props (key, label)
        VALUES (${prop.key}, ${prop.label})
        ON CONFLICT (key) DO NOTHING
      `;
    }
    console.log(`✅ Seeded ${habitatProps.length} habitat props`);

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}
