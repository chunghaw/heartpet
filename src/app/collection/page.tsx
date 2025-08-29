'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Award } from 'lucide-react'

interface CheckIn {
  id: string
  text: string
  emoji?: number
  created_at: string
}

interface Execution {
  id: string
  action_title: string
  category: string
  seconds: number
  xp_earned: number
  created_at: string
  helpful?: boolean
}

export default function CollectionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'checkins' | 'actions'>('checkins')

  useEffect(() => {
    if (!session?.user) return

    const fetchHistory = async () => {
      try {
        // Fetch check-ins
        const checkInsResponse = await fetch('/api/checkins')
        if (checkInsResponse.ok) {
          const checkInsData = await checkInsResponse.json()
          setCheckIns(checkInsData.checkins || [])
        }

        // Fetch executions
        const executionsResponse = await fetch('/api/executions')
        if (executionsResponse.ok) {
          const executionsData = await executionsResponse.json()
          setExecutions(executionsData.executions || [])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [session])

  if (!session?.user) {
    return <div className="p-4">Please sign in to continue.</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmoji = (emojiCode?: number) => {
    if (!emojiCode) return '😊'
    return String.fromCodePoint(emojiCode)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'connect': 'bg-blue-100 text-blue-800',
      'tidy': 'bg-green-100 text-green-800',
      'nourish': 'bg-yellow-100 text-yellow-800',
      'soothe': 'bg-purple-100 text-purple-800',
      'reset': 'bg-red-100 text-red-800'
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-3"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Your Collection</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your history...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('checkins')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'checkins'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Check-ins ({checkIns.length})
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'actions'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Actions ({executions.length})
              </button>
            </div>

            {/* Content */}
            {activeTab === 'checkins' ? (
              <div className="space-y-3">
                {checkIns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No check-ins yet. Start your journey!</p>
                  </div>
                ) : (
                  checkIns.map((checkIn) => (
                    <div key={checkIn.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getEmoji(checkIn.emoji)}</div>
                        <div className="flex-1">
                          <p className="text-gray-800 mb-2">{checkIn.text}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(checkIn.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {executions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No completed actions yet. Complete your first Care Quest!</p>
                  </div>
                ) : (
                  executions.map((execution) => (
                    <div key={execution.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1">{execution.action_title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(execution.category)}`}>
                              {execution.category}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock size={12} className="mr-1" />
                              {execution.seconds}s
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(execution.created_at)}
                            </div>
                            <div className="flex items-center text-xs text-green-600">
                              <Award size={12} className="mr-1" />
                              +{execution.xp_earned} XP
                            </div>
                          </div>
                        </div>
                        {execution.helpful !== null && (
                          <div className={`ml-2 text-lg ${execution.helpful ? 'text-green-500' : 'text-gray-400'}`}>
                            {execution.helpful ? '👍' : '👎'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
