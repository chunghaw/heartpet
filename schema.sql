-- HeartPet Database Schema for Vercel Postgres

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
  species VARCHAR(50) NOT NULL, -- seedling_spirit, cloud_kitten, pocket_dragon
  color VARCHAR(7) NOT NULL, -- hex color
  size VARCHAR(10) NOT NULL, -- sm, md, lg
  breed VARCHAR(100),
  stage VARCHAR(20) NOT NULL DEFAULT 'egg', -- egg, hatchling, sproutling, floof
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
  embedding REAL[] -- Vector for Milvus
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emoji INTEGER,
  cues JSONB, -- VisionCues as JSON
  mood VARCHAR(20), -- calm, happy, playful, focused, sensitive, creative, intense
  energy VARCHAR(10), -- low, medium, high
  focus TEXT[], -- Body focus areas
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_pet_id ON executions(pet_id);
CREATE INDEX IF NOT EXISTS idx_category_weights_user_id ON category_weights(user_id);
