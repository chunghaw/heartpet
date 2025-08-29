

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// More tolerant schema that handles empty strings and null values
const ImageDataUrl = z.union([
  z.string().startsWith("data:image"), // valid data URL
  z.string().length(0),                 // tolerate "" if client sends it
]).optional().nullable();

const WeatherObj = z.object({
  temp_c: z.number().optional(),
  precip: z.boolean().optional(),
  daylight: z.boolean().optional(),
  weather: z.string().optional(),
  good_outdoor_brief: z.boolean().optional(),
  good_outdoor_sheltered: z.boolean().optional(),
  good_window_nature: z.boolean().optional(),
}).optional().nullable();

const Body = z.object({
  userId: z.string(),
  text: z.string().min(1),
  emoji: z.number().int().min(-2).max(2).optional(),
  imageSelfie: ImageDataUrl,
  imageEnv: ImageDataUrl,
  weather: WeatherObj,
}).transform((b) => ({
  ...b,
  // Normalize empty strings and null to undefined
  imageSelfie: (b.imageSelfie && b.imageSelfie.startsWith?.("data:image")) ? b.imageSelfie : undefined,
  imageEnv: (b.imageEnv && b.imageEnv.startsWith?.("data:image")) ? b.imageEnv : undefined,
  weather: b.weather ?? undefined,
}));

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
    console.log('🔍 Analyzing input:', JSON.stringify(input, null, 2));
    
    const body = Body.parse(input)
    console.log('✅ Parsed body:', JSON.stringify(body, null, 2));
    
    const preFlag = RED_FLAG.test(body.text)
    console.log('🚩 Pre-flag check:', preFlag);
    
    // Simple cues extraction (no vision for now)
    const cues = { ...(body.weather || {}) }
    console.log('🌤️ Weather cues:', cues);

    const prompt = `User says: "${body.text}"\n\nAnalyze this and respond with the JSON format specified.`
    console.log('📝 Sending prompt to OpenAI:', prompt);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM },
        { role: 'user', content: prompt }
      ]
    })
    
    console.log('🤖 OpenAI response:', response.choices[0]?.message?.content);
    
    try {
      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      console.log('✅ Parsed OpenAI result:', result);
      
      const finalResult = { ...result, cues, red_flags: preFlag || result.red_flags }
      console.log('🎯 Final analysis result:', finalResult);
      
      return finalResult;
    } catch (parseError) {
      console.log('⚠️ OpenAI response parse failed, using fallback:', parseError);
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
    console.error('❌ Analyze failed:', error)
    throw error
  }
}

// Simple recommend function (Postgres fallback)
async function recommendAction(input: any) {
  try {
    console.log('🎯 Recommending action for input:', JSON.stringify(input, null, 2));
    
    // For now, return a simple action from the database
    // This will be enhanced later with proper vector search
    const recommendation = {
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
    };
    
    console.log('✅ Recommendation:', recommendation);
    return recommendation;
  } catch (error) {
    console.error('❌ Recommend failed:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Coach API called');
    
    const input = await req.json()
    console.log('📥 Received input:', JSON.stringify(input, null, 2));
    
    // Direct function calls instead of HTTP requests
    console.log('🔍 Calling analyzeInput...');
    const analysis = await analyzeInput(input)
    console.log('✅ Analysis complete:', JSON.stringify(analysis, null, 2));
    
    if (analysis.red_flags) {
      console.log('🚩 Red flags detected, returning crisis response');
      return NextResponse.json({ 
        empathy: analysis.empathy, 
        question: analysis.question, 
        red_flags: true, 
        crisisBanner: true, 
        cues: analysis.cues 
      })
    }
    
    console.log('🎯 Calling recommendAction...');
    const recommendation = await recommendAction({
      userId: input.userId, 
      text: input.text, 
      mood: analysis.mood, 
      energy: analysis.energy, 
      focus: analysis.focus, 
      cues: analysis.cues 
    })
    console.log('✅ Recommendation complete:', JSON.stringify(recommendation, null, 2));
    
    const finalResponse = { 
      empathy: analysis.empathy, 
      question: analysis.question, 
      red_flags: false, 
      micro_action: recommendation, 
      cues: analysis.cues 
    };
    
    console.log('🎉 Final response:', JSON.stringify(finalResponse, null, 2));
    return NextResponse.json(finalResponse)
    
  } catch (error) {
    console.error('💥 Coach API error:', error)
    
    // Return detailed error for debugging
    if (error instanceof z.ZodError) {
      console.error('🔍 Zod validation errors:', error.issues);
      return NextResponse.json({ 
        error: 'validation_failed', 
        details: error.issues,
        message: 'Invalid input data format'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'internal_error', 
      message: (error as Error)?.message || 'Unknown error occurred'
    }, { status: 500 })
  }
}
