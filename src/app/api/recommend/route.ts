export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@vercel/postgres'
import OpenAI from 'openai'
import { weatherAffinity } from '@/lib/weather-affinity'
import { buildQuery } from '@/lib/query'
import { COMPOSE_ACTION_SYSTEM } from '@/lib/prompts'
import { searchActions, isMilvusAvailable } from '@/lib/milvus'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const Body = z.object({
  userId: z.string(),
  text: z.string(),
  mood: z.string(),
  energy: z.enum(['low', 'medium', 'high']),
  focus: z.array(z.string()),
  cues: z.record(z.any()).optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json())
    
    // Build query string for embedding
    const q = buildQuery({ 
      text: body.text, 
      mood: body.mood, 
      energy: body.energy, 
      focus: body.focus, 
      cues: body.cues || {} 
    })
    
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q
    })
    
    const vec = embedding.data[0].embedding
    
    // Try Milvus first, fallback to Postgres
    let candidates: Array<{ action_id: string; category: string; score: number }> = []
    
    if (isMilvusAvailable()) {
      try {
        console.log('🔍 Using Milvus for vector search...')
        candidates = await searchActions(vec, 8)
        console.log(`✅ Milvus returned ${candidates.length} candidates`)
      } catch (error) {
        console.log('⚠️ Milvus failed, falling back to Postgres:', error)
        candidates = []
      }
    }
    
    // Fallback: brute force cosine in Postgres on small dataset
    if (!candidates.length) {
      console.log('🔄 Using Postgres fallback for vector search...')
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
      console.log(`✅ Postgres fallback returned ${candidates.length} candidates`)
    }
    
    if (!candidates.length) {
      return NextResponse.json({ error: 'no_actions_found' }, { status: 404 })
    }
    
    // Get full action details from Postgres
    const actionIds = candidates.map(c => c.action_id)
    const { rows: actions } = await sql`
      SELECT id, title, steps, seconds, category, tags, why
      FROM actions 
      WHERE id = ANY(${actionIds})
    `
    
    // Create lookup map
    const actionMap = new Map(actions.map(a => [a.id, a]))
    
    // Get user's recent executions for novelty scoring
    const recentExecutions = await sql`
      SELECT action_id, COUNT(*) as times_done
      FROM executions 
      WHERE user_id = ${body.userId} 
      AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY action_id
    `
    
    const recentMap = new Map(recentExecutions.rows.map((r: any) => [r.action_id, r.times_done]))
    
    // Score and rank actions
    const scored = candidates.map(c => {
      const action = actionMap.get(c.action_id)
      if (!action) return null
      
      const tags: string[] = action.tags || []
      const waff = weatherAffinity(tags, body.cues)
      
      // Scoring weights with proper novelty
      const cos = c.score
      const weight = 1.0 // Default category weight
      const fit = body.energy === 'low' ? 1 : body.energy === 'medium' ? 0.5 : 0
      
      // Novelty: penalize recently done actions
      const timesDone = recentMap.get(action.id) || 0
      const nov = Math.max(0.1, 1 - (timesDone * 0.3)) // Reduce novelty for repeated actions
      
      const final = 0.65 * cos + 0.25 * weight + 0.07 * fit + 0.03 * nov + waff
      
      return { 
        ...action, 
        cos, 
        weight, 
        fit_energy: fit, 
        novelty: +nov.toFixed(3), 
        weather_affinity: +waff.toFixed(3), 
        final 
      }
    }).filter(Boolean).sort((a, b) => b.final - a.final)
    
    if (!scored.length) {
      return NextResponse.json({ error: 'no_actions_found' }, { status: 404 })
    }
    
    const best = scored[0]
    
    // Compose creative variant based on context
    let composed = { title: best.title, steps: best.steps, seconds: best.seconds }
    
    try {
      const composeInput = {
        base_action: best.title,
        base_steps: best.steps,
        context: `User feeling: ${body.mood}, energy: ${body.energy}, focus: ${body.focus.join(', ')}`,
        weather: body.cues
      }
      
      const comp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
          { role: 'system', content: COMPOSE_ACTION_SYSTEM },
          { role: 'user', content: JSON.stringify(composeInput) }
        ]
      })
      
      try { 
        composed = JSON.parse(comp.choices[0]?.message?.content || "{}") 
      } catch {} 
    } catch (error) { 
      console.log('Composition failed, using base action:', error) 
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
        weight: +best.weight.toFixed(3),
        fit_energy: +best.fit_energy.toFixed(3),
        novelty: +best.novelty.toFixed(3),
        weather_affinity: best.weather_affinity
      }
    })
    
  } catch (error) {
    console.error('Recommend API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
