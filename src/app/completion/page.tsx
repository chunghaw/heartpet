'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface CompletionData {
  action: {
    action_id: string
    title: string
    category: string
  }
  xp: number
  newStage?: string
}

export default function CompletionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('completionData')
    if (stored) {
      setCompletionData(JSON.parse(stored))
    } else {
      router.push('/')
    }
  }, [router])

  const handleHelpful = async (value: boolean) => {
    if (!session?.user || !completionData) return
    
    setHelpful(value)
    
    try {
      await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          petId: 'temp', // Will need to get from context
          actionId: completionData.action.action_id,
          seconds: 0, // Not needed for feedback
          foreground_ratio: 1,
          hold_confirm: true,
          completed: false, // Just updating feedback
          helpful: value
        })
      })
      
      setSubmitted(true)
    } catch (error) {
      console.error('Feedback submission failed:', error)
    }
  }

  const handleDoAnother = () => {
    // Clear stored data and go back to check-in
    sessionStorage.removeItem('coachResponse')
    sessionStorage.removeItem('currentAction')
    sessionStorage.removeItem('completionData')
    router.push('/checkin')
  }

  const handleGoHome = () => {
    // Clear stored data and go home
    sessionStorage.removeItem('coachResponse')
    sessionStorage.removeItem('currentAction')
    sessionStorage.removeItem('completionData')
    router.push('/')
  }

  if (!session?.user) {
    return <div className="p-4">Please sign in to continue.</div>
  }

  if (!completionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading completion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          {/* Celebration */}
          <div className="mb-6">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Amazing job!
            </h1>
            <p className="text-gray-600">
              You completed "{completionData.action.title}"
            </p>
          </div>
          
          {/* XP Gain */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              +10 XP
            </div>
            <div className="text-sm text-yellow-700">
              Total: {completionData.xp} XP
            </div>
            {completionData.newStage && (
              <div className="mt-2 text-sm text-yellow-700 font-medium">
                🆕 New stage: {completionData.newStage}!
              </div>
            )}
          </div>
          
          {/* Affirmation */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
              💝 You're doing great!
            </h3>
            <p className="text-blue-700 text-sm">
              Every small step counts toward your emotional wellness. 
              You're building healthy habits one micro-action at a time.
            </p>
          </div>
          
          {/* Helpful Feedback */}
          {!submitted ? (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Was this helpful?
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleHelpful(true)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  👍 Yes
                </button>
                <button
                  onClick={() => handleHelpful(false)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  👎 No
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm">
                Thanks for your feedback! We'll use this to improve your future recommendations.
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDoAnother}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Do Another Care Quest
            </button>
            <button
              onClick={handleGoHome}
              className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
