import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rows } = await sql`
      SELECT id, text, emoji, created_at
      FROM checkins 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ checkins: rows })
  } catch (error) {
    console.error('Failed to fetch check-ins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
