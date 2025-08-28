export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'missing' }, { status: 400 })
    }
    
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,is_day`, 
      { cache: 'no-store' }
    )
    
    const j = await r.json()
    const c = j.current || {}
    
    return NextResponse.json({ 
      temp_c: Math.round(c.temperature_2m ?? 0), 
      precip: (c.precipitation ?? 0) > 0, 
      daylight: Boolean(c.is_day) 
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'weather_failed' }, { status: 500 })
  }
}
