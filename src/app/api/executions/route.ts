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
      SELECT 
        e.id,
        a.title as action_title,
        a.category,
        e.seconds,
        e.helpful,
        e.created_at,
        CASE WHEN e.completed = true THEN 10 ELSE 0 END as xp_earned
      FROM executions e
      JOIN actions a ON e.action_id = a.id
      WHERE e.user_id = ${session.user.id}
      ORDER BY e.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ executions: rows })
  } catch (error) {
    console.error('Failed to fetch executions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
