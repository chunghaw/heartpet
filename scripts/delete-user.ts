import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables
config()

async function deleteUser(email: string) {
  try {
    console.log(`🗑️ Starting deletion of user: ${email}`)
    
    // First, find the user
    const { rows: users } = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `
    
    if (users.length === 0) {
      console.log(`❌ User ${email} not found in database`)
      return
    }
    
    const userId = users[0].id
    console.log(`✅ Found user: ${email} (ID: ${userId})`)
    
    // Delete in order to respect foreign key constraints
    console.log('🗑️ Deleting executions...')
    const { rowCount: executionsDeleted } = await sql`
      DELETE FROM executions WHERE user_id = ${userId}
    `
    console.log(`✅ Deleted ${executionsDeleted} executions`)
    
    console.log('🗑️ Deleting checkins...')
    const { rowCount: checkinsDeleted } = await sql`
      DELETE FROM checkins WHERE user_id = ${userId}
    `
    console.log(`✅ Deleted ${checkinsDeleted} checkins`)
    
    console.log('🗑️ Deleting category weights...')
    const { rowCount: weightsDeleted } = await sql`
      DELETE FROM category_weights WHERE user_id = ${userId}
    `
    console.log(`✅ Deleted ${weightsDeleted} category weights`)
    
    console.log('🗑️ Deleting pet...')
    const { rowCount: petsDeleted } = await sql`
      DELETE FROM pets WHERE user_id = ${userId}
    `
    console.log(`✅ Deleted ${petsDeleted} pets`)
    
    console.log('🗑️ Deleting user...')
    const { rowCount: userDeleted } = await sql`
      DELETE FROM users WHERE id = ${userId}
    `
    console.log(`✅ Deleted ${userDeleted} user`)
    
    console.log(`🎉 Successfully deleted user ${email} and all associated data!`)
    
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    throw error
  }
}

// Run the deletion
const email = 'chunghaw35@gmail.com'
deleteUser(email)
  .then(() => {
    console.log('✅ User deletion completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ User deletion failed:', error)
    process.exit(1)
  })
