const hits = new Map<string, { n: number; t: number }>()

export function limited(ip: string, limit = 60, windowMs = 60_000) {
  const now = Date.now()
  const rec = hits.get(ip) || { n: 0, t: now }
  
  if (now - rec.t > windowMs) {
    rec.n = 0
    rec.t = now
  }
  
  rec.n++
  hits.set(ip, rec)
  
  return rec.n > limit // true → over limit
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, rec] of hits.entries()) {
    if (now - rec.t > 300_000) { // 5 minutes
      hits.delete(ip)
    }
  }
}, 60_000) // Clean every minute
