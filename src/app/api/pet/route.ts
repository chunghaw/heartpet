import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPet } from '@/lib/database';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

// Level calculation functions
function calculateLevel(xp: number) {
  if (xp < 10) return 1
  if (xp < 30) return 2  // 10 XP for level 1->2
  if (xp < 50) return 3  // 20 XP for level 2->3
  if (xp < 70) return 4  // 20 XP for level 3->4
  if (xp < 90) return 5  // 20 XP for level 4->5
  if (xp < 110) return 6 // 20 XP for level 5->6 (from level 5 onwards, 20 XP)
  if (xp < 130) return 7
  if (xp < 150) return 8
  if (xp < 170) return 9
  if (xp < 190) return 10
  return Math.floor((xp - 190) / 20) + 10 // Level 10+ needs 20 XP each
}

function xpForNextLevel(currentLevel: number) {
  if (currentLevel === 1) return 10
  if (currentLevel < 5) return 20
  return 20 // From level 5 onwards, 20 XP
}

function stageForLevel(level: number) { 
  if (level >= 10) return 'floof'
  if (level >= 2) return 'hatchling'
  return 'egg'
}

const UpdatePetBody = z.object({
  name: z.string().min(1).max(50).optional(),
  species: z.enum(['doggo', 'kitten', 'dragon']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  breed: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pet = await getUserPet(session.user.id);
    
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Calculate level and XP info
    const level = calculateLevel(pet.xp);
    const xpForNext = xpForNextLevel(level);
    const stage = stageForLevel(level);

    // Update pet stage if it doesn't match calculated stage
    if (pet.stage !== stage) {
      await sql`UPDATE pets SET stage = ${stage} WHERE id = ${pet.id}`;
    }

    const petWithLevel = {
      ...pet,
      level,
      xpForNext,
      stage
    };

    return NextResponse.json({ pet: petWithLevel });
  } catch (error) {
    console.error('Failed to fetch pet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, species } = body;

    if (!name || !species) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already has a pet
    const existingPet = await getUserPet(session.user.id);
    if (existingPet) {
      return NextResponse.json({ error: 'User already has a pet' }, { status: 400 });
    }

    // Create new pet
    const { rows } = await sql`
      INSERT INTO pets (user_id, name, species, color, size, stage, xp)
      VALUES (${session.user.id}, ${name}, ${species}, '#22c55e', 'md', 'egg', 0)
      RETURNING *
    `;

    return NextResponse.json({ pet: rows[0] });
  } catch (error) {
    console.error('Failed to create pet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = UpdatePetBody.parse(await request.json());
    
    // Get current pet
    const pet = await getUserPet(session.user.id);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.species !== undefined) {
      updates.push(`species = $${paramIndex++}`);
      values.push(body.species);
    }
    if (body.size !== undefined) {
      updates.push(`size = $${paramIndex++}`);
      values.push(body.size);
    }
    if (body.breed !== undefined) {
      updates.push(`breed = $${paramIndex++}`);
      values.push(body.breed);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add pet ID to values
    values.push(pet.id);

    const updateQuery = `
      UPDATE pets 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await sql.query(updateQuery, values);
    const updatedPet = rows[0];

    return NextResponse.json({ pet: updatedPet });
  } catch (error) {
    console.error('Failed to update pet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
