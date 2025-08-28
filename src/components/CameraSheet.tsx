'use client'

import { useEffect, useRef, useState } from 'react'

export default function CameraSheet({ 
  open, 
  facing = 'user', 
  onClose, 
  onCaptured 
}: {
  open: boolean
  facing?: 'user' | 'environment'
  onClose: () => void
  onCaptured: (dataUrl: string, facing: 'user' | 'environment') => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mode, setMode] = useState<'user' | 'environment'>(facing)

  useEffect(() => {
    if (!open) return
    
    let active = true
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode } 
        })
        if (!active) return
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      } catch (e) { 
        console.error('Camera access failed:', e) 
      }
    })()

    return () => { 
      active = false
      stream?.getTracks().forEach(t => t.stop()) 
    }
  }, [open, mode])

  if (!open) return null

  const take = () => {
    const v = videoRef.current!
    const w = v.videoWidth, h = v.videoHeight, max = 512, scale = Math.min(1, max / Math.max(w, h))
    const c = document.createElement('canvas')
    c.width = Math.round(w * scale)
    c.height = Math.round(h * scale)
    const g = c.getContext('2d')!
    g.drawImage(v, 0, 0, c.width, c.height)
    const data = c.toDataURL('image/jpeg', 0.8) // ephemeral base64
    onCaptured(data, mode)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-4">
        <p className="text-sm text-gray-700 mb-2">
          <b>Optional AI scan.</b> We don't store photos; we extract neutral cues and discard the image.
        </p>
        <div className="aspect-[3/4] bg-black rounded-xl overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => setMode(mode === 'user' ? 'environment' : 'user')} 
            className="flex-1 border rounded-lg py-2"
          >
            Flip
          </button>
          <button 
            onClick={take} 
            className="flex-1 bg-black text-white rounded-lg py-2"
          >
            Capture
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 border rounded-lg py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
