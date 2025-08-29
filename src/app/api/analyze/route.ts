export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import { limited } from '@/lib/rateLimit'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

const VISION_PROMPT = `
Return ONLY neutral, non-identifying cues from the image as JSON:
{ "lighting":"dim|normal|bright|fluorescent|daylight",
  "desk_clutter":"low|medium|high",
  "indoor_outdoor":"indoor|outdoor",
  "time_hint":"day|night|unknown",
  "face_tension":"possible|not_observed",
  "eye_strain":"possible|not_observed" }
Do NOT infer age, gender, race, or diagnose. If multiple people/NSFW, respond {"vision_supported":false}.
`.trim()

const ANALYZE_SYSTEM = `
You are a gentle companion with a playful, non-patronising voice.
1) Reflect feelings in ≤3 warm, non-clinical sentences.
2) Ask exactly one curious question.
3) Infer energy ("low"|"medium"|"high"), mood ("calm"|"happy"|"playful"|"focused"|"sensitive"|"creative"|"intense"),
   and focus tags (mix of care + movement, e.g., connect|tidy|nourish|soothe|reset|wrist/forearm|neck/shoulder|back/hip|eyes/brain|breath|energise).
4) If crisis or urgent medical risk → "red_flags": true.
Return STRICT JSON: { empathy, question, mood, energy, focus[], red_flags } only.
`.trim()

async function cuesFromImage(dataUrl?: string) {
  if (!dataUrl) return {}
  
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: VISION_PROMPT },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Return JSON only.' }, 
            { type: 'image_url', image_url: { url: dataUrl } }
          ] as any
        }
      ]
    })
    
    try { 
      return JSON.parse(r.choices[0]?.message?.content || '{}') 
    } catch { 
      return {} 
    }
  } catch (error) {
    console.error('Vision API failed:', error)
    return {}
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (limited(ip, 30, 60_000)) { // 30 requests per minute
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  
  try {
    const body = Body.parse(await req.json())
    const preFlag = RED_FLAG.test(body.text)
    
    const selfie = await cuesFromImage(body.imageSelfie)
    const env = await cuesFromImage(body.imageEnv)
    
    if (selfie.vision_supported === false || env.vision_supported === false) {
      return NextResponse.json({ error: 'vision_not_supported' }, { status: 400 })
    }

    const cues = { ...env, ...selfie, ...(body.weather || {}) }
    
    // Merge weather affinity flags
    if (body.weather) {
      cues.weather = body.weather.weather;
      cues.good_outdoor_brief = Boolean(body.weather.good_outdoor_brief);
      cues.good_outdoor_sheltered = Boolean(body.weather.good_outdoor_sheltered);
      cues.good_window_nature = Boolean(body.weather.good_window_nature);
    }
    
    const user = `
TEXT: ${body.text}
EMOJI: ${body.emoji ?? 'none'}
CUES: ${JSON.stringify(cues)}
Return strict JSON only.
`.trim()

    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM },
        { role: 'user', content: user }
      ]
    })

    let out: any = {}
    try { 
      out = JSON.parse(r.choices[0]?.message?.content || '{}') 
    } catch { 
      out = { 
        empathy: "Thanks for sharing—let's keep it small and kind.", 
        question: "Would a breath or a tidy micro-step feel easier?", 
        mood: "calm", 
        energy: "medium", 
        focus: ["soothe"], 
        red_flags: preFlag 
      } 
    }
    
    out.red_flags = Boolean(preFlag || out.red_flags)
    
    return NextResponse.json({ ...out, cues })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
