export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    
    // Call analyze API
    const a = await fetch(new URL('/api/analyze', req.url), { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify(input) 
    }).then(r => r.json())
    
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
    const r = await fetch(new URL('/api/recommend', req.url), { 
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
    }).then(r => r.json())
    
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
