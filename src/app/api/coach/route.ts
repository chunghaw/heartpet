export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Copy the analyze logic directly here to avoid internal HTTP calls
const Body = z.object({
  text: z.string().min(1),
  emoji: z.number().int().min(-2).max(2).optional(),
  imageSelfie: z.string().startsWith('data:image').max(300_000).optional(),
  imageEnv: z.string().startsWith('data:image').max(300_000).optional(),
  weather: z.object({ 
    temp_c: z.number().optional(), 
    precip: z.boolean().optional(), 
    daylight: z.boolean().optional() 
  }).optional()
})

const RED_FLAG = /(suicide|kill myself|self[-\s]?harm|i want to die|chest pain|tight chest with pain|loss of (bladder|bowel))/i

const ANALYZE_SYSTEM = `
You are a gentle companion with a playful, non-patronising voice.
1) Reflect feelings in ≤3 warm, non-clinical sentences.
2) Ask exactly one curious question.
3) Infer energy ("low"|"medium"|"high"), mood ("calm"|"happy"|"playful"|"focused"|"sensitive"|"creative"|"intense"),
   and focus tags (mix of care + movement, e.g., connect|tidy|nourish|soothe|reset|wrist/forearm|neck/shoulder|back/hip|eyes/brain|breath|energise).
4) If crisis or urgent medical risk → "red_flags": true.
Return STRICT JSON: { empathy, question, mood, energy, focus[], red_flags } only.
`.trim()

async function analyzeInput(input: any) {
  try {
    const body = Body.parse(input)
    const preFlag = RED_FLAG.test(body.text)
    
    // Simple cues extraction (no vision for now)
    const cues = { ...(body.weather || {}) }
    
    // Add basic weather cues
    if (body.weather) {
      cues.temp_c = body.weather.temp_c;
      cues.precip = body.weather.precip;
      cues.daylight = body.weather.daylight;
    }

    const prompt = `User says: "${body.text}"\n\nAnalyze this and respond with the JSON format specified.`
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM },
        { role: 'user', content: prompt }
      ]
    })
    
    try {
      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      return { ...result, cues, red_flags: preFlag || result.red_flags }
    } catch {
      // Fallback response
      return {
        empathy: "I hear you're going through something challenging. It's okay to feel this way.",
        question: "What's one small thing that might help you feel a bit better right now?",
        mood: "sensitive",
        energy: "low",
        focus: ["soothe", "connect"],
        red_flags: preFlag,
        cues
      }
    }
  } catch (error) {
    console.error('Analyze failed:', error)
    throw error
  }
}

// Simple recommend function (Postgres fallback)
async function recommendAction(input: any) {
  try {
    // For now, return a simple action from the database
    // This will be enhanced later with proper vector search
    return {
      action_id: "simple_breathing",
      title: "Take 3 deep breaths",
      steps: [
        "Find a comfortable position",
        "Close your eyes",
        "Breathe in for 4 counts, hold for 4, exhale for 4"
      ],
      seconds: 60,
      category: "Soothe",
      tags: ["breathing", "calm", "mindfulness"],
      why: "Deep breathing activates your parasympathetic nervous system, helping you feel calmer and more centered.",
      explain: {
        cos: 0.8,
        weight: 1.0,
        fit_energy: 1.0,
        novelty: 0.9,
        weather_affinity: 0.0
      }
    }
  } catch (error) {
    console.error('Recommend failed:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    
    // Direct function calls instead of HTTP requests
    const analysis = await analyzeInput(input)
    
    if (analysis.red_flags) {
      return NextResponse.json({ 
        empathy: analysis.empathy, 
        question: analysis.question, 
        red_flags: true, 
        crisisBanner: true, 
        cues: analysis.cues 
      })
    }
    
    const recommendation = await recommendAction({
      userId: input.userId, 
      text: input.text, 
      mood: analysis.mood, 
      energy: analysis.energy, 
      focus: analysis.focus, 
      cues: analysis.cues 
    })
    
    return NextResponse.json({ 
      empathy: analysis.empathy, 
      question: analysis.question, 
      red_flags: false, 
      micro_action: recommendation, 
      cues: analysis.cues 
    })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
