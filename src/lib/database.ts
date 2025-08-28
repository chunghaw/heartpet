import { sql } from '@vercel/postgres';
import { Pet, CheckIn, Execution, CategoryWeight } from '@/types';

// Type assertion helper
function assertPet(row: any): Pet {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    species: row.species,
    color: row.color,
    size: row.size,
    breed: row.breed,
    stage: row.stage,
    xp: row.xp,
    created_at: new Date(row.created_at),
  };
}

function assertCheckIn(row: any): CheckIn {
  return {
    id: row.id,
    user_id: row.user_id,
    text: row.text,
    emoji: row.emoji,
    cues: row.cues,
    mood: row.mood,
    energy: row.energy,
    focus: row.focus || [],
    red_flags: row.red_flags,
    created_at: new Date(row.created_at),
  };
}

function assertExecution(row: any): Execution {
  return {
    id: row.id,
    user_id: row.user_id,
    pet_id: row.pet_id,
    action_id: row.action_id,
    seconds: row.seconds,
    foreground_ratio: row.foreground_ratio,
    hold_confirm: row.hold_confirm,
    completed: row.completed,
    helpful: row.helpful,
    created_at: new Date(row.created_at),
  };
}

function assertCategoryWeight(row: any): CategoryWeight {
  return {
    user_id: row.user_id,
    category: row.category,
    weight: row.weight,
  };
}

// Database utility functions
export async function getUserPet(userId: string): Promise<Pet | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM pets 
      WHERE user_id = ${userId} 
      LIMIT 1
    `;
    return rows[0] ? assertPet(rows[0]) : null;
  } catch (error) {
    console.error('Failed to get user pet:', error);
    return null;
  }
}

export async function createCheckIn(data: {
  user_id: string;
  text: string;
  emoji?: number;
  cues?: any;
  mood?: string;
  energy?: string;
  focus?: string[];
  red_flags: boolean;
}): Promise<CheckIn> {
  const { rows } = await sql`
    INSERT INTO checkins (user_id, text, emoji, cues, mood, energy, focus, red_flags)
    VALUES (${data.user_id}, ${data.text}, ${data.emoji}, ${JSON.stringify(data.cues)}, ${data.mood}, ${data.energy}, ${JSON.stringify(data.focus)}, ${data.red_flags})
    RETURNING *
  `;
  return assertCheckIn(rows[0]);
}

export async function createExecution(data: {
  user_id: string;
  pet_id: string;
  action_id: string;
  seconds: number;
  foreground_ratio: number;
  hold_confirm: boolean;
  completed: boolean;
  helpful?: boolean;
}): Promise<Execution> {
  const { rows } = await sql`
    INSERT INTO executions (user_id, pet_id, action_id, seconds, foreground_ratio, hold_confirm, completed, helpful)
    VALUES (${data.user_id}, ${data.pet_id}, ${data.action_id}, ${data.seconds}, ${data.foreground_ratio}, ${data.hold_confirm}, ${data.completed}, ${data.helpful})
    RETURNING *
  `;
  return assertExecution(rows[0]);
}

export async function updatePetXP(petId: string, xpGain: number): Promise<Pet> {
  const { rows } = await sql`
    UPDATE pets 
    SET xp = xp + ${xpGain}
    WHERE id = ${petId}
    RETURNING *
  `;
  
  if (rows.length === 0) {
    throw new Error('Pet not found');
  }
  
  const pet = rows[0];
  const newStage = stageForXP(pet.xp);
  
  // Update stage if needed
  if (pet.stage !== newStage) {
    const { rows: updatedRows } = await sql`
      UPDATE pets 
      SET stage = ${newStage}
      WHERE id = ${petId}
      RETURNING *
    `;
    return updatedRows[0];
  }
  
  return pet;
}

export async function updateCategoryWeight(userId: string, category: string, delta: number): Promise<CategoryWeight> {
  // Get current weight
  const { rows } = await sql`
    SELECT weight FROM category_weights 
    WHERE user_id = ${userId} AND category = ${category}
  `;
  
  const currentWeight = rows[0]?.weight ?? 1.0;
  const newWeight = Math.max(0.5, Math.min(2.0, currentWeight + delta));
  
  // Upsert weight
  const { rows: upsertRows } = await sql`
    INSERT INTO category_weights (user_id, category, weight)
    VALUES (${userId}, ${category}, ${newWeight})
    ON CONFLICT (user_id, category) 
    DO UPDATE SET weight = ${newWeight}
    RETURNING *
  `;
  
  return upsertRows[0];
}

export async function getUserCategoryWeights(userId: string): Promise<Map<string, number>> {
  const { rows } = await sql`
    SELECT category, weight FROM category_weights 
    WHERE user_id = ${userId}
  `;
  
  return new Map(rows.map(w => [w.category, w.weight]));
}

export async function getRecentExecutions(userId: string, limit: number = 5): Promise<Execution[]> {
  const { rows } = await sql`
    SELECT e.*, a.title, a.category 
    FROM executions e
    JOIN actions a ON e.action_id = a.id
    WHERE e.user_id = ${userId}
    ORDER BY e.created_at DESC
    LIMIT ${limit}
  `;
  
  return rows;
}

export async function createDefaultPet(userId: string): Promise<Pet> {
  const { rows } = await sql`
    INSERT INTO pets (user_id, name, species, color, size, stage, xp)
    VALUES (${userId}, 'My Pet', 'seedling_spirit', '#22c55e', 'md', 'egg', 0)
    RETURNING *
  `;
  return rows[0];
}

// Utility function for stage calculation
function stageForXP(xp: number): string {
  if (xp >= 150) return 'floof';
  if (xp >= 100) return 'sproutling';
  if (xp >= 50) return 'hatchling';
  return 'egg';
}
