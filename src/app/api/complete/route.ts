export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

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
  if (level >= 7) return 'sproutling' 
  if (level >= 4) return 'hatchling'
  return 'egg'
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    
    // Log execution
    await sql`
      insert into executions(user_id, pet_id, action_id, seconds, foreground_ratio, hold_confirm, completed, helpful)
      values(${b.userId}, ${b.petId}, ${b.actionId}, ${b.seconds}, ${b.foreground_ratio}, ${b.hold_confirm}, ${b.completed}, ${b.helpful})
    `
    
    let newLevel: number | undefined, newStage: string | undefined, xp: number | undefined, xpForNext: number | undefined
    
    if (b.completed) {
      const upd = await sql`update pets set xp = xp + 10 where id=${b.petId} returning xp`
      xp = Number(upd.rows[0].xp)
      const level = calculateLevel(xp)
      const stage = stageForLevel(level)
      const xpForNext = xpForNextLevel(level)
      
      await sql`update pets set stage=${stage} where id=${b.petId}`
      newLevel = level
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
    
    return NextResponse.json({ ok: true, xp, newLevel, newStage, xpForNext })
  } catch (error) {
    console.error('Complete API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
