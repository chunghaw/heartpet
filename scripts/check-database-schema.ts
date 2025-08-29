import { sql } from '@vercel/postgres'
import dotenv from 'dotenv'

dotenv.config()

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...')
    
    // Check if checkins table exists
    const checkinsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'checkins'
    `
    
    if (checkinsTable.rows.length === 0) {
      console.log('❌ checkins table does not exist!')
      console.log('Creating checkins table...')
      
      await sql`
        CREATE TABLE IF NOT EXISTS checkins (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          text TEXT NOT NULL,
          emoji INTEGER,
          image_selfie TEXT,
          image_env TEXT,
          weather_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
      console.log('✅ Created checkins table')
    } else {
      console.log('✅ checkins table exists')
    }
    
    // Show table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'checkins'
      ORDER BY ordinal_position
    `
    
    console.log('\n📋 checkins table structure:')
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    // Check if executions table exists
    const executionsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'executions'
    `
    
    if (executionsTable.rows.length === 0) {
      console.log('\n❌ executions table does not exist!')
      console.log('Creating executions table...')
      
      await sql`
        CREATE TABLE IF NOT EXISTS executions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          pet_id TEXT NOT NULL,
          action_id TEXT NOT NULL,
          seconds INTEGER NOT NULL,
          foreground_ratio REAL NOT NULL,
          hold_confirm BOOLEAN NOT NULL,
          completed BOOLEAN NOT NULL,
          helpful BOOLEAN,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
      console.log('✅ Created executions table')
    } else {
      console.log('\n✅ executions table exists')
    }
    
    // Count records
    const checkinsCount = await sql`SELECT COUNT(*) as count FROM checkins`
    const executionsCount = await sql`SELECT COUNT(*) as count FROM executions`
    
    console.log(`\n📊 Record counts:`)
    console.log(`  - checkins: ${checkinsCount.rows[0].count}`)
    console.log(`  - executions: ${executionsCount.rows[0].count}`)
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error)
  }
}

checkDatabaseSchema()
