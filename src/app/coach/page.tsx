'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SafetyBanner from '@/components/SafetyBanner'

interface CoachResponse {
  empathy: string
  question: string
  red_flags: boolean
  crisisBanner?: boolean
  micro_action?: {
    action_id: string
    title: string
    steps: string[]
    seconds: number
    category: string
    why: string
    explain: {
      cos: number
      weight: number
      fit_energy: number
      novelty: number
    }
  }
  cues?: any
}

function CoachPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const debug = searchParams.get('debug') === '1'
  
  const [response, setResponse] = useState<CoachResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('coachResponse')
    if (stored) {
      setResponse(JSON.parse(stored))
      setLoading(false)
    } else {
      // Redirect back to check-in if no response
      router.push('/checkin')
    }
  }, [router])

  if (!session?.user) {
    return <div className="p-4">Please sign in to continue.</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your feelings...</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return <div className="p-4">Something went wrong. Please try again.</div>
  }

  const handleStartAction = () => {
    if (response.micro_action) {
      // Store action data for action page
      sessionStorage.setItem('currentAction', JSON.stringify(response.micro_action))
      router.push('/action')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Your Care Quest
        </h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Crisis Banner */}
          {response.red_flags && <SafetyBanner />}
          
          {/* Empathy */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">💭 Reflection</h2>
            <p className="text-black leading-relaxed">{response.empathy}</p>
          </div>
          
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">🤔 Question</h2>
            <p className="text-black leading-relaxed">{response.question}</p>
          </div>
          
          {/* Action Suggestion */}
          {!response.red_flags && response.micro_action && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                🎯 Your Micro-Action
              </h2>
              <h3 className="font-medium text-blue-900 mb-2">
                {response.micro_action.title}
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                {response.micro_action.why}
              </p>
              <div className="text-xs text-blue-600 mb-3">
                <span className="inline-block bg-blue-200 px-2 py-1 rounded mr-2">
                  {response.micro_action.category}
                </span>
                <span className="inline-block bg-blue-200 px-2 py-1 rounded">
                  {response.micro_action.seconds}s
                </span>
              </div>
              <ol className="text-sm text-blue-800 space-y-1">
                {response.micro_action.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* Start Button */}
          {!response.red_flags && response.micro_action && (
            <button
              onClick={handleStartAction}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all"
            >
              Start My Care Quest
            </button>
          )}
          
          {/* Crisis Support */}
          {response.red_flags && (
            <div className="text-center text-gray-600">
                        <p className="mb-4 text-black">
            Take care of yourself. Consider reaching out to someone you trust or a professional.
          </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          )}
        </div>
        
        {/* Debug Panel */}
        {debug && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-2">🐛 Debug Info</h3>
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">Raw Response</summary>
              <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CoachPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CoachPageContent />
    </Suspense>
  )
}
