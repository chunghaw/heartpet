export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

function stageForXP(xp: number) { 
  return xp >= 150 ? 'floof' : xp >= 100 ? 'sproutling' : xp >= 10 ? 'hatchling' : 'egg' 
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    
    // Log execution
    await sql`
      insert into executions(user_id, pet_id, action_id, seconds, foreground_ratio, hold_confirm, completed, helpful)
      values(${b.userId}, ${b.petId}, ${b.actionId}, ${b.seconds}, ${b.foreground_ratio}, ${b.hold_confirm}, ${b.completed}, ${b.helpful})
    `
    
    let newStage: string | undefined, xp: number | undefined
    
    if (b.completed) {
      const upd = await sql`update pets set xp = xp + 10 where id=${b.petId} returning xp`
      xp = Number(upd.rows[0].xp)
      const stage = stageForXP(xp)
      await sql`update pets set stage=${stage} where id=${b.petId}`
      newStage = stage
    }
    
    // Personalization
    if (typeof b.helpful === 'boolean') {
      const { rows } = await sql`select category from actions where id=${b.actionId}`
      const cat = rows[0]?.category as string | undefined
      
      if (cat) {
        const delta = b.helpful ? 0.1 : -0.05
        await sql`
          insert into category_weights(user_id, category, weight)
          values(${b.userId}, ${cat}, 1.0)
          on conflict (user_id,category) do update
          set weight = LEAST(2.0, GREATEST(0.5, category_weights.weight + ${delta}))
        `
      }
    }
    
    return NextResponse.json({ ok: true, xp, newStage })
  } catch (error) {
    console.error('Complete API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
