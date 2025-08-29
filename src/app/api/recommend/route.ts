export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import { sql } from '@vercel/postgres'
import { searchTopK } from '@/lib/milvus'
import { weatherAffinity } from '@/lib/weather-affinity'
import { buildQuery } from '@/lib/query'
import { COMPOSE_ACTION_SYSTEM } from '@/lib/prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const Body = z.object({
  userId: z.string(),
  text: z.string(),
  mood: z.string(),
  energy: z.enum(['low', 'medium', 'high']),
  focus: z.array(z.string()).min(1),
  cues: z.record(z.any()).optional()
})

function fitEnergy(a: 'low' | 'medium' | 'high', b: 'low' | 'medium' | 'high') {
  if (a === b) return 1
  if ((a === 'low' && b === 'medium') || (a === 'medium' && (b === 'low' || b === 'high')) || (a === 'high' && b === 'medium')) return 0.5
  return 0
}

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json())
    
    const q = buildQuery({
      text: body.text,
      mood: body.mood,
      energy: body.energy,
      focus: body.focus,
      cues: body.cues || {}
    })
    const emb = await openai.embeddings.create({ 
      model: 'text-embedding-3-small', 
      input: q 
    })
    const vec = emb.data[0].embedding

    // Milvus search
    let candidates: Array<{ action_id: string; category: string; score: number }> = []
    try { 
      candidates = await searchTopK(vec, 8) 
    } catch (e) { 
      console.log('Milvus search failed, falling back to Postgres:', e)
    }

    // Fallback: brute force cosine in Postgres on small dataset
    if (!candidates.length) {
      const { rows } = await sql`select id as action_id, category, embedding from actions where embedding is not null`
      
      function cosine(a: number[], b: any) {
        // Handle both array and JSON formats
        const bArray = Array.isArray(b) ? b : JSON.parse(b);
        let dot = 0, na = 0, nb = 0
        for (let i = 0; i < a.length; i++) { 
          const x = a[i], y = bArray[i]
          dot += x * y
          na += x * x
          nb += y * y 
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9)
      }
      
      candidates = rows.map((r: any) => ({ 
        action_id: r.action_id, 
        category: r.category, 
        score: cosine(vec, r.embedding) 
      }))
      candidates.sort((a, b) => b.score - a.score)
      candidates = candidates.slice(0, 8)
    }

    // Personal weights
    const wRows = await sql`select category, weight from category_weights where user_id = ${body.userId}`
    const wMap = new Map(wRows.rows.map((r: any) => [r.category, Number(r.weight)]))

    // Novelty: count in last 5 executions
    const recent = await sql`
      select action_id, count(*)::int as n 
      from executions 
      where user_id=${body.userId} 
      group by action_id
      order by max(created_at) desc
      limit 5
    `
    const recentMap = new Map(recent.rows.map((r: any) => [r.action_id, r.n]))

    // Fetch actions
    const ids = candidates.map(c => c.action_id)
    const data = await sql`select id, title, steps, seconds, category, why from actions where id = any(${ids})`

    const scored = data.rows.map((row: any) => {
      const c = candidates.find(x => x.action_id === row.id)!
      const tags: string[] = row.tags || []
      const weight = wMap.get(row.category) ?? 1
      const fit = fitEnergy(body.energy, body.energy as any) // simple for now; can tag actions later
      const nov = 1 - Math.min(1, (recentMap.get(row.id) ?? 0) / 2)
      const waff = weatherAffinity(tags, body.cues)
      
      const final = 0.65 * c.score + 0.25 * weight + 0.07 * fit + 0.03 * nov + waff
      return { ...row, cos: c.score, weight, fit_energy: fit, novelty: nov, weather_affinity: +waff.toFixed(3), final }
    }).sort((a, b) => b.final - a.final)

    const best = scored[0]
    
    // Compose creative variant based on context
    let composed = { title: best.title, steps: best.steps, seconds: best.seconds };
    try {
      const composeInput = {
        base: { title: best.title, steps: best.steps, seconds: best.seconds, tags: best.tags, why: best.why, category: best.category },
        cues: body.cues, mood: body.mood, energy: body.energy, text: body.text
      };
      
      const comp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: COMPOSE_ACTION_SYSTEM },
          { role: "user", content: JSON.stringify(composeInput) }
        ]
      });
      
      try { 
        composed = JSON.parse(comp.choices[0]?.message?.content || "{}"); 
      } catch {} 
    } catch (error) {
      console.log('Composition failed, using base action:', error);
    }
    
    return NextResponse.json({
      action_id: best.id,
      title: composed.title || best.title,
      steps: composed.steps?.length ? composed.steps : best.steps,
      seconds: composed.seconds || best.seconds,
      category: best.category,
      tags: best.tags,
      why: best.why,
      explain: { 
        cos: +best.cos.toFixed(3), 
        weight: +best.weight.toFixed(2), 
        fit_energy: best.fit_energy, 
        novelty: +best.novelty.toFixed(2),
        weather_affinity: best.weather_affinity
      }
    })
  } catch (error) {
    console.error('Recommend API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
