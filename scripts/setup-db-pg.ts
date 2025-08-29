import { Client } from 'pg';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Setting up database tables...');
    
    // Create tables using the proper schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        email_verified TIMESTAMP,
        image TEXT,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        species VARCHAR(50) NOT NULL,
        color VARCHAR(7) NOT NULL,
        size VARCHAR(10) NOT NULL DEFAULT 'md',
        breed VARCHAR(100),
        stage VARCHAR(20) NOT NULL DEFAULT 'egg',
        xp INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS actions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title VARCHAR(255) NOT NULL,
        steps TEXT[] NOT NULL,
        seconds INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        why TEXT NOT NULL,
        embedding REAL[]
      );
    `);
    
    await client.query(`
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
    `);
    
    await client.query(`
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
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS category_weights (
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0,
        PRIMARY KEY (user_id, category)
      );
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_executions_pet_id ON executions(pet_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_category_weights_user_id ON category_weights(user_id);');
    
    console.log('✅ Database tables created successfully!');
    
    // Insert sample actions with proper fields
    console.log('Seeding initial actions...');
    
    const actions = [
      {
        title: 'Take 3 deep breaths',
        steps: ['Find a comfortable position', 'Close your eyes', 'Breathe in for 4 counts, hold for 4, exhale for 4'],
        seconds: 60,
        category: 'Soothe',
        why: 'Deep breathing activates your parasympathetic nervous system, helping you feel calmer and more centered.'
      },
      {
        title: 'Stretch your arms overhead',
        steps: ['Stand up straight', 'Reach arms overhead', 'Hold for 10 seconds', 'Slowly lower arms'],
        seconds: 90,
        category: 'Connect',
        why: 'Simple stretching releases muscle tension and helps you reconnect with your body.'
      },
      {
        title: 'Drink a glass of water',
        steps: ['Get a glass of water', 'Sip slowly and mindfully', 'Feel the water hydrating your body'],
        seconds: 120,
        category: 'Nourish',
        why: 'Hydration supports both physical and mental clarity, and taking a moment to drink mindfully can be grounding.'
      },
      {
        title: 'Look out the window for 2 minutes',
        steps: ['Find a window', 'Look at the sky, trees, or buildings', 'Notice the colors and movement'],
        seconds: 120,
        category: 'Reset',
        why: 'Gazing at distant objects gives your eyes a break and can help reset your mental state.'
      },
      {
        title: 'Write down one thing you\'re grateful for',
        steps: ['Grab a pen and paper', 'Think of something positive', 'Write it down in one sentence'],
        seconds: 180,
        category: 'Connect',
        why: 'Gratitude practice shifts your focus from problems to blessings, improving your overall mood.'
      }
    ];
    
    for (const action of actions) {
      // Generate embedding for the action
      const textForEmbedding = `${action.title} ${action.category} ${action.why} ${action.steps.join(' ')}`;
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textForEmbedding
      });
      
      const embeddingArray = embedding.data[0].embedding;
      
      await client.query(`
        INSERT INTO actions (title, steps, seconds, category, why, embedding)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (title) DO NOTHING
      `, [action.title, action.steps, action.seconds, action.category, action.why, embeddingArray]);
    }
    
    console.log('✅ Initial actions seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('🎉 Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });
