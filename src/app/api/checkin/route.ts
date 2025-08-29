import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@vercel/postgres'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { text, emoji, imageSelfie, imageEnv, weather } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Save check-in to database
    const result = await sql`
      INSERT INTO checkins (user_id, text, emoji, created_at)
      VALUES (${session.user.id}, ${text.trim()}, ${emoji || null}, NOW())
      RETURNING id, text, emoji, created_at
    `

    return NextResponse.json({ 
      success: true, 
      checkin: result.rows[0] 
    })
  } catch (error) {
    console.error('Failed to save check-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
