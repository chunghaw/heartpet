import { sql } from '@vercel/postgres'
import dotenv from 'dotenv'

dotenv.config()

async function updatePetSpecies() {
  try {
    console.log('🔄 Updating pet species names...')
    
    // Update legacy species names to new ones
    const result = await sql`
      UPDATE pets 
      SET species = CASE 
        WHEN species = 'pocket_dragon' THEN 'dragon'
        WHEN species = 'cloud_kitten' THEN 'kitten'
        WHEN species = 'seedling_spirit' THEN 'doggo'
        ELSE species
      END
      WHERE species IN ('pocket_dragon', 'cloud_kitten', 'seedling_spirit')
      RETURNING id, name, species
    `
    
    console.log(`✅ Updated ${result.rows.length} pets:`)
    result.rows.forEach(pet => {
      console.log(`  - ${pet.name}: ${pet.species}`)
    })
    
    // Show all pets
    const allPets = await sql`SELECT id, name, species, stage, xp FROM pets`
    console.log('\n📊 All pets in database:')
    allPets.rows.forEach(pet => {
      console.log(`  - ${pet.name}: ${pet.species} (${pet.stage}, ${pet.xp} XP)`)
    })
    
  } catch (error) {
    console.error('❌ Error updating pet species:', error)
  }
}

updatePetSpecies()
