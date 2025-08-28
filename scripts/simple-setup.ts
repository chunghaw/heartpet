import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Setting up database tables...');
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) DEFAULT 'My Pet',
        species VARCHAR(100) DEFAULT 'seedling_spirit',
        color VARCHAR(7) DEFAULT '#22c55e',
        size VARCHAR(10) DEFAULT 'md',
        breed VARCHAR(100),
        stage VARCHAR(50) DEFAULT 'egg',
        xp INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS actions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(100),
        steps JSONB,
        seconds INTEGER,
        tags TEXT[],
        embedding JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        text TEXT,
        emoji INTEGER,
        mood VARCHAR(50),
        energy VARCHAR(20),
        focus TEXT[],
        red_flags BOOLEAN DEFAULT FALSE,
        cues JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS executions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
        action_id INTEGER REFERENCES actions(id) ON DELETE CASCADE,
        seconds INTEGER,
        foreground_ratio DECIMAL(5,2),
        hold_confirm BOOLEAN DEFAULT FALSE,
        completed BOOLEAN DEFAULT FALSE,
        helpful BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS category_weights (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100),
        weight DECIMAL(3,2) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, category)
      );
    `);
    
    console.log('✅ Database tables created successfully!');
    
    // Insert sample actions
    console.log('Seeding initial data...');
    
    const actions = [
      {
        title: 'Take 3 deep breaths',
        description: 'Breathe in for 4 counts, hold for 4, exhale for 4',
        category: 'Soothe',
        steps: ['Find a comfortable position', 'Close your eyes', 'Breathe deeply'],
        seconds: 60,
        tags: ['breathing', 'calm', 'mindfulness']
      },
      {
        title: 'Stretch your arms',
        description: 'Simple arm stretches to release tension',
        category: 'Connect',
        steps: ['Stand up straight', 'Reach arms overhead', 'Hold for 10 seconds'],
        seconds: 90,
        tags: ['stretching', 'movement', 'tension-release']
      },
      {
        title: 'Drink a glass of water',
        description: 'Hydrate your body and mind',
        category: 'Nourish',
        steps: ['Get a glass of water', 'Sip slowly', 'Feel refreshed'],
        seconds: 120,
        tags: ['hydration', 'health', 'self-care']
      }
    ];
    
    for (const action of actions) {
      await client.query(`
        INSERT INTO actions (title, description, category, steps, seconds, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (title) DO NOTHING
      `, [action.title, action.description, action.category, JSON.stringify(action.steps), action.seconds, action.tags]);
    }
    
    console.log('✅ Initial data seeded successfully!');
    
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
