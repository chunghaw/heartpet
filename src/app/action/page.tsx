'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Action {
  action_id: string
  title: string
  steps: string[]
  seconds: number
  category: string
  why: string
}

export default function ActionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [action, setAction] = useState<Action | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [foregroundRatio, setForegroundRatio] = useState(1)
  const [showHold, setShowHold] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  
  const holdRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    const stored = sessionStorage.getItem('currentAction')
    if (stored) {
      const actionData = JSON.parse(stored)
      setAction(actionData)
      setTimeLeft(actionData.seconds)
    } else {
      router.push('/checkin')
    }
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      setShowHold(true)
    }
    
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  // Page visibility tracking
  useEffect(() => {
    let hiddenTime = 0
    let totalTime = 0
    let startTime = Date.now()
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now()
      } else {
        if (hiddenTime > 0) {
          totalTime += Date.now() - hiddenTime
          hiddenTime = 0
        }
      }
    }
    
    const handleFocus = () => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        const visible = elapsed - totalTime
        const ratio = Math.max(0, visible / elapsed)
        setForegroundRatio(ratio)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const startAction = () => {
    setIsActive(true)
    startTimeRef.current = Date.now()
  }

  const handleHoldStart = () => {
    if (foregroundRatio < 0.8) {
      alert('Please keep the app visible to complete your action!')
      return
    }
    
    setHoldProgress(0)
    holdRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdRef.current)
          handleComplete()
          return 100
        }
        return prev + 2
      })
    }, 40) // 2 seconds = 100 steps * 40ms
  }

  const handleHoldEnd = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      setHoldProgress(0)
    }
  }

  const handleComplete = async () => {
    if (!action || !session?.user) return
    
    setCompleted(true)
    
    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          petId: 'temp', // Will need to get from context
          actionId: action.action_id,
          seconds: action.seconds,
          foreground_ratio: foregroundRatio,
          hold_confirm: true,
          completed: true,
          helpful: null // Will be set on completion page
        })
      })
      
      const data = await response.json()
      
      // Store completion data
      sessionStorage.setItem('completionData', JSON.stringify({
        action,
        xp: data.xp,
        newStage: data.newStage
      }))
      
      // Navigate to completion page after a short delay
      setTimeout(() => {
        router.push('/completion')
      }, 2000)
    } catch (error) {
      console.error('Completion failed:', error)
    }
  }

  if (!session?.user) {
    return <div className="p-4">Please sign in to continue.</div>
  }

  if (!action) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your action...</p>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {action.title}
        </h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Timer */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">
              {isActive ? 'Action in progress...' : 'Ready to start'}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((action.seconds - timeLeft) / action.seconds) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Steps */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Steps:</h3>
            <ol className="space-y-2">
              {action.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Foreground Indicator */}
          <div className="mb-6 p-3 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">App Visibility:</span>
              <span className="text-sm font-medium">
                {Math.round(foregroundRatio * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  foregroundRatio >= 0.8 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${foregroundRatio * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep the app visible to complete your action
            </p>
          </div>
          
          {/* Action Controls */}
          {!isActive && !showHold && (
            <button
              onClick={startAction}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all"
            >
              Start Action
            </button>
          )}
          
          {/* Hold to Complete */}
          {showHold && !completed && (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Great job! Hold the button to complete your action
              </p>
              <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className="w-32 h-32 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-medium text-lg hover:from-green-600 hover:to-blue-700 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  Hold
                </div>
                <div 
                  className="absolute bottom-0 left-0 bg-white/30 h-full transition-all duration-100"
                  style={{ width: `${holdProgress}%` }}
                ></div>
              </button>
              <p className="text-sm text-gray-600 mt-2">
                {holdProgress}% complete
              </p>
            </div>
          )}
          
          {/* Completion State */}
          {completed && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Action Completed!
              </h3>
              <p className="text-gray-600">
                Redirecting to completion page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
