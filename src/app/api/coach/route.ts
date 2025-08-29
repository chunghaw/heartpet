export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    
    // Get the base URL from the request
    const baseUrl = new URL(req.url).origin
    
    // Call analyze API
    const analyzeResponse = await fetch(`${baseUrl}/api/analyze`, { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify(input) 
    })
    
    if (!analyzeResponse.ok) {
      throw new Error(`Analyze API failed: ${analyzeResponse.status}`)
    }
    
    const a = await analyzeResponse.json()
    
    if (a.red_flags) {
      return NextResponse.json({ 
        empathy: a.empathy, 
        question: a.question, 
        red_flags: true, 
        crisisBanner: true, 
        cues: a.cues 
      })
    }
    
    // Call recommend API
    const recommendResponse = await fetch(`${baseUrl}/api/recommend`, { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify({ 
        userId: input.userId, 
        text: input.text, 
        mood: a.mood, 
        energy: a.energy, 
        focus: a.focus, 
        cues: a.cues 
      }) 
    })
    
    if (!recommendResponse.ok) {
      throw new Error(`Recommend API failed: ${recommendResponse.status}`)
    }
    
    const r = await recommendResponse.json()
    
    return NextResponse.json({ 
      empathy: a.empathy, 
      question: a.question, 
      red_flags: false, 
      micro_action: r, 
      cues: a.cues 
    })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
