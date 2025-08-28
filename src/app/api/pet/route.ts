import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPet } from '@/lib/database';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const UpdatePetBody = z.object({
  name: z.string().min(1).max(50).optional(),
  species: z.enum(['seedling_spirit', 'cloud_kitten', 'pocket_dragon']).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
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

    return NextResponse.json({ pet });
  } catch (error) {
    console.error('Failed to fetch pet:', error);
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
    if (body.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(body.color);
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
