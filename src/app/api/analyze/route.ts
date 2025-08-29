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
    daylight: z.boolean().optional(),
    weather: z.string().optional(),
    good_outdoor_brief: z.boolean().optional(),
    good_outdoor_sheltered: z.boolean().optional(),
    good_window_nature: z.boolean().optional()
  }).optional()
})

const RED_FLAG = /(suicide|kill myself|self[-\s]?harm|i want to die|chest pain|tight chest with pain|loss of (bladder|bowel))/i

const SELFIE_VISION_PROMPT = `
Analyze this selfie image and return ONLY neutral, non-identifying insights as JSON:
{
  "mood_indicators": "calm|focused|tired|energized|stressed|relaxed",
  "energy_level": "low|medium|high",
  "facial_tension": "none|slight|moderate|high",
  "eye_state": "bright|tired|strained|relaxed",
  "overall_vibe": "peaceful|busy|contemplative|social|private"
}
Focus on emotional and energy cues only. Do NOT infer age, gender, race, or diagnose.
If multiple people/NSFW, respond {"vision_supported":false}.
`.trim()

const SURROUNDINGS_VISION_PROMPT = `
Analyze this surroundings image and return ONLY neutral, non-identifying insights as JSON:
{
  "environment_type": "home|office|outdoor|public|transport|other",
  "lighting_quality": "dim|soft|bright|harsh|natural|artificial",
  "space_organization": "cluttered|organized|minimal|lived_in|sterile",
  "activity_context": "work|relaxation|social|exercise|travel|other",
  "comfort_level": "cozy|formal|casual|stressful|peaceful"
}
Focus on environmental and contextual cues only. Do NOT identify specific objects or locations.
If multiple people/NSFW, respond {"vision_supported":false}.
`.trim()

const WEATHER_INSIGHT_PROMPT = `
Based on this weather data, provide a brief, empathetic insight about how it might affect someone's mood and energy:
{
  "mood_influence": "uplifting|calming|energizing|soothing|challenging|neutral",
  "energy_impact": "boosts|reduces|maintains|varies",
  "activity_suggestion": "indoor_focus|outdoor_opportunity|mixed_activities|weather_appropriate",
  "emotional_tone": "bright|cozy|refreshing|comforting|invigorating|peaceful"
}
Keep it brief and positive, focusing on how weather can support well-being.
`.trim()

const ANALYZE_SYSTEM = `
You are a gentle companion with a playful, non-patronising voice.
Analyze the user's input and provide insights in this exact JSON format:

{
  "selfie_insights": "What your selfie tells us about your current state (if selfie provided)",
  "surroundings_insights": "What your surroundings tell us about your environment (if surroundings provided)", 
  "weather_insights": "What the weather tells us about your current context (if weather provided)",
  "reflection": "Compile all available information into a warm, empathetic reflection (≤3 sentences)",
  "question": "Ask exactly one curious question based on the combined insights",
  "mood": "calm|happy|playful|focused|sensitive|creative|intense",
  "energy": "low|medium|high",
  "focus": ["tag1", "tag2", "tag3"],
  "red_flags": false
}

IMPORTANT: Only include insights for information that was actually provided. If no selfie, set selfie_insights to null. Same for surroundings and weather.
`.trim()

async function analyzeSelfie(dataUrl?: string) {
  if (!dataUrl) return null
  
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SELFIE_VISION_PROMPT },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Analyze this selfie and return JSON only.' }, 
            { type: 'image_url', image_url: { url: dataUrl } }
          ] as any
        }
      ]
    })
    
    try { 
      const result = JSON.parse(r.choices[0]?.message?.content || '{}')
      return result.vision_supported === false ? null : result
    } catch { 
      return null
    }
  } catch (error) {
    console.error('Selfie analysis failed:', error)
    return null
  }
}

async function analyzeSurroundings(dataUrl?: string) {
  if (!dataUrl) return null
  
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SURROUNDINGS_VISION_PROMPT },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Analyze these surroundings and return JSON only.' }, 
            { type: 'image_url', image_url: { url: dataUrl } }
          ] as any
        }
      ]
    })
    
    try { 
      const result = JSON.parse(r.choices[0]?.message?.content || '{}')
      return result.vision_supported === false ? null : result
    } catch { 
      return null
    }
  } catch (error) {
    console.error('Surroundings analysis failed:', error)
    return null
  }
}

async function analyzeWeather(weather?: any) {
  if (!weather) return null
  
  try {
    const weatherContext = `
Temperature: ${weather.temp_c || 'unknown'}°C
Precipitation: ${weather.precip ? 'Yes' : 'No'}
Daylight: ${weather.daylight ? 'Day' : 'Night'}
Weather: ${weather.weather || 'Unknown'}
Outdoor suitability: ${weather.good_outdoor_brief ? 'Good for brief outdoor' : 'Indoor recommended'}
    `.trim()
    
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: WEATHER_INSIGHT_PROMPT },
        { role: 'user', content: `Analyze this weather: ${weatherContext}` }
      ]
    })
    
    try { 
      return JSON.parse(r.choices[0]?.message?.content || '{}')
    } catch { 
      return null
    }
  } catch (error) {
    console.error('Weather analysis failed:', error)
    return null
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
    
    console.log('🔍 Analyzing input with:', {
      hasSelfie: !!body.imageSelfie,
      hasSurroundings: !!body.imageEnv,
      hasWeather: !!body.weather
    })
    
    // Analyze all available inputs
    const selfieAnalysis = await analyzeSelfie(body.imageSelfie)
    const surroundingsAnalysis = await analyzeSurroundings(body.imageEnv)
    const weatherAnalysis = await analyzeWeather(body.weather)
    
    // Build context for LLM
    const context = {
      text: body.text,
      emoji: body.emoji,
      selfie: selfieAnalysis,
      surroundings: surroundingsAnalysis,
      weather: weatherAnalysis
    }
    
    const userPrompt = `
User Input: "${body.text}"
Emoji: ${body.emoji ?? 'none'}

${selfieAnalysis ? `Selfie Analysis: ${JSON.stringify(selfieAnalysis)}` : 'No selfie provided'}
${surroundingsAnalysis ? `Surroundings Analysis: ${JSON.stringify(surroundingsAnalysis)}` : 'No surroundings provided'}
${weatherAnalysis ? `Weather Analysis: ${JSON.stringify(weatherAnalysis)}` : 'No weather provided'}

Analyze this information and provide insights in the exact JSON format specified.
`.trim()

    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM },
        { role: 'user', content: userPrompt }
      ]
    })

    let out: any = {}
    try { 
      out = JSON.parse(r.choices[0]?.message?.content || '{}') 
    } catch { 
      out = { 
        selfie_insights: null,
        surroundings_insights: null,
        weather_insights: null,
        reflection: "Thanks for sharing—let's keep it small and kind.", 
        question: "Would a breath or a tidy micro-step feel easier?", 
        mood: "calm", 
        energy: "medium", 
        focus: ["soothe"], 
        red_flags: preFlag 
      } 
    }
    
    // Ensure all fields are present
    out.selfie_insights = out.selfie_insights || null
    out.surroundings_insights = out.surroundings_insights || null
    out.weather_insights = out.weather_insights || null
    out.reflection = out.reflection || "Thanks for sharing your feelings."
    out.question = out.question || "What might help you feel a bit better right now?"
    out.mood = out.mood || "calm"
    out.energy = out.energy || "medium"
    out.focus = out.focus || ["soothe"]
    out.red_flags = Boolean(preFlag || out.red_flags)
    
    // Add raw analysis data for debugging
    const cues = {
      selfie: selfieAnalysis,
      surroundings: surroundingsAnalysis,
      weather: weatherAnalysis
    }
    
    return NextResponse.json({ ...out, cues })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
