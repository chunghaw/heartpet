'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { useEffect } from 'react'

interface PetProps {
  stage: string
  mood?: string
  onCelebrate?: () => void
  className?: string
}

export default function Pet({ stage, mood, onCelebrate, className = '' }: PetProps) {
  const { RiveComponent, rive } = useRive({
    src: `/pets/${stage}.riv`,
    stateMachines: 'Pet',
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  })

  useEffect(() => {
    if (rive && mood) {
      // Map mood to number input (0-6 for different moods)
      const moodMap: Record<string, number> = {
        calm: 0,
        happy: 1,
        playful: 2,
        focused: 3,
        sensitive: 4,
        creative: 5,
        intense: 6,
      }
      
      const moodValue = moodMap[mood] || 0
      rive.scrub('Pet', 'mood', moodValue)
    }
  }, [rive, mood])

  const triggerCelebrate = () => {
    if (rive) {
      rive.fire('Pet', 'celebrate')
      onCelebrate?.()
    }
  }

  const triggerBlink = () => {
    if (rive) {
      rive.fire('Pet', 'blink')
    }
  }

  // Auto-blink every few seconds
  useEffect(() => {
    const interval = setInterval(triggerBlink, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [rive])

  return (
    <div className={`relative ${className}`}>
      <RiveComponent 
        className="w-full h-full"
        onMouseEnter={triggerBlink}
      />
      
      {/* Debug controls for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 flex gap-2">
          <button 
            onClick={triggerCelebrate}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            🎉
          </button>
          <button 
            onClick={triggerBlink}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded"
          >
            👁️
          </button>
        </div>
      )}
    </div>
  )
}
