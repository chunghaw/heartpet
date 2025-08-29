'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SafetyBanner from '@/components/SafetyBanner'
import PetImage from '@/components/PetImage'
import { Pet } from '@/types'

interface CoachResponse {
  selfie_insights?: string | null
  surroundings_insights?: string | null
  weather_insights?: string | null
  reflection: string
  question: string
  red_flags: boolean
  crisisBanner?: boolean
  micro_action?: {
    action_id: string
    title: string
    steps: string[]
    seconds: number
    category: string
    tags?: string[]
    why: string
    explain: {
      cos: number
      weight: number
      fit_energy: number
      novelty: number
      weather_affinity?: number
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
  const [pet, setPet] = useState<Pet | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('coachResponse')
    if (stored) {
      setResponse(JSON.parse(stored))
      setLoading(false)
    } else {
      // Redirect back to check-in if no response
      router.push('/checkin')
    }

    // Fetch pet data
    const fetchPet = async () => {
      try {
        const response = await fetch('/api/pet')
        if (response.ok) {
          const data = await response.json()
          setPet(data.pet)
        }
      } catch (error) {
        console.error('Failed to fetch pet:', error)
      }
    }
    fetchPet()
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
          
          {/* Selfie Insights */}
          {response.selfie_insights && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">📸 What Your Selfie Tells Us</h2>
              <p className="text-purple-700 leading-relaxed">{response.selfie_insights}</p>
            </div>
          )}
          
          {/* Surroundings Insights */}
          {response.surroundings_insights && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-800 mb-2">🏠 What Your Surroundings Tell Us</h2>
              <p className="text-green-700 leading-relaxed">{response.surroundings_insights}</p>
            </div>
          )}
          
          {/* Weather Insights */}
          {response.weather_insights && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">🌤️ What The Weather Tells Us</h2>
              <p className="text-blue-700 leading-relaxed">{response.weather_insights}</p>
            </div>
          )}
          
          {/* Reflection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">💭 Reflection</h2>
            <div className="flex items-start space-x-3">
              {pet && (
                <div className="flex-shrink-0">
                  <PetImage pet={pet} size="sm" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-black leading-relaxed">{response.reflection}</p>
                {pet && (
                  <p className="text-sm text-gray-500 mt-2">
                    — {pet.name} 💝
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-2">🤔 Question</h2>
            <p className="text-black leading-relaxed">{response.question}</p>
            
            {/* User Input Field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer (optional):
              </label>
              <textarea
                placeholder="Share your thoughts..."
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600"
                onChange={(e) => {
                  // Store user's answer for potential future use
                  sessionStorage.setItem('userAnswer', e.target.value);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps us personalize future recommendations
              </p>
            </div>

            {/* Reset Quest Button */}
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  const userAnswer = sessionStorage.getItem('userAnswer') || '';
                  const originalData = sessionStorage.getItem('checkinData');
                  if (originalData) {
                    const data = JSON.parse(originalData);
                    
                    // Add user feedback to the request
                    const resetPayload = {
                      ...data,
                      userFeedback: userAnswer,
                      resetRequest: true
                    };
                    
                    try {
                      const response = await fetch('/api/coach', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(resetPayload)
                      });
                      
                      if (response.ok) {
                        const newData = await response.json();
                        sessionStorage.setItem('coachResponse', JSON.stringify(newData));
                        window.location.reload(); // Refresh to show new quest
                      } else {
                        console.error('Reset failed:', response.status, response.statusText);
                      }
                    } catch (error) {
                      console.error('Reset failed:', error);
                    }
                  } else {
                    console.error('No checkin data found for reset');
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
              >
                🔄 Reset Quest
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Get a different suggestion based on your feedback
              </p>
            </div>
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
                <span className="inline-block bg-blue-200 px-2 py-1 rounded mr-2">
                  {response.micro_action.seconds}s
                </span>
                {response.micro_action.tags && response.micro_action.tags.length > 0 && (
                  <span className="inline-block bg-green-200 px-2 py-1 rounded">
                    {response.micro_action.tags.slice(0, 2).join(', ')}
                  </span>
                )}
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
            {response.micro_action && (
              <details className="text-sm mt-2">
                <summary className="cursor-pointer text-gray-600">Scoring Breakdown</summary>
                <div className="mt-2 p-2 bg-gray-200 rounded text-xs">
                  <div>Cosine Similarity: {response.micro_action.explain.cos}</div>
                  <div>Category Weight: {response.micro_action.explain.weight}</div>
                  <div>Energy Fit: {response.micro_action.explain.fit_energy}</div>
                  <div>Novelty: {response.micro_action.explain.novelty}</div>
                  {response.micro_action.explain.weather_affinity && (
                    <div>Weather Affinity: {response.micro_action.explain.weather_affinity}</div>
                  )}
                </div>
              </details>
            )}
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
