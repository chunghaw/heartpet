'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CameraSheet from '@/components/CameraSheet'

export default function CheckInPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(0)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [imageSelfie, setImageSelfie] = useState<string>('')
  const [imageEnv, setImageEnv] = useState<string>('')
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  if (!session?.user) {
    return <div className="p-4">Please sign in to continue.</div>
  }

  const handleLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      
      const response = await fetch(`/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
      const weatherData = await response.json()
      setWeather(weatherData)
    } catch (error) {
      console.error('Location access failed:', error)
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    
    try {
      // Build payload - only include fields that have actual values
      const payload: any = {
        userId: session.user.id,
        text: text.trim(),
      };

      // Only include emoji if it's not 0 (neutral)
      if (emoji !== 0) {
        payload.emoji = emoji;
      }

      // Only include images if they're valid data URLs
      if (imageSelfie && imageSelfie.startsWith('data:image')) {
        payload.imageSelfie = imageSelfie;
      }
      if (imageEnv && imageEnv.startsWith('data:image')) {
        payload.imageEnv = imageEnv;
      }

      // Only include weather if it has actual data
      if (weather && typeof weather === 'object' && Object.keys(weather).length > 0) {
        payload.weather = {
          temp_c: weather.temp_c,
          precip: !!weather.precip,
          daylight: !!weather.daylight,
          weather: weather.weather,
          good_outdoor_brief: !!weather.good_outdoor_brief,
          good_outdoor_sheltered: !!weather.good_outdoor_sheltered,
          good_window_nature: !!weather.good_window_nature,
        };
      }

      console.log('📤 Sending payload to Coach API:', payload);

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      // Store in sessionStorage for coach page
      sessionStorage.setItem('coachResponse', JSON.stringify(data))
      
      // Navigate to coach page
      router.push('/coach')
    } catch (error) {
      console.error('Check-in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCameraCapture = (dataUrl: string, facing: 'user' | 'environment') => {
    if (facing === 'user') {
      setImageSelfie(dataUrl)
    } else {
      setImageEnv(dataUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          How are you feeling?
        </h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Share your thoughts
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I'm feeling..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-600"
            />
          </div>
          
          {/* Emoji Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Mood: {emoji === -2 ? '😢' : emoji === -1 ? '😕' : emoji === 0 ? '😐' : emoji === 1 ? '🙂' : '😊'}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              value={emoji}
              onChange={(e) => setEmoji(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
B) With selfie (valid data URL), no env image, no weatherB) With selfie (valid data URL), no env image, no weather            <div className="flex justify-between text-xs text-black mt-1">
              <span>😢</span>
              <span>😕</span>
              <span>😐</span>
              <span>🙂</span>
              <span>😊</span>
            </div>
          </div>
          
          {/* Camera Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Optional: Add context
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCameraFacing('user')
                  setCameraOpen(true)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium"
              >
                📸 Selfie
              </button>
              <button
                onClick={() => {
                  setCameraFacing('environment')
                  setCameraOpen(true)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium"
              >
                🏠 Surroundings
              </button>
            </div>
            
            {/* Image Previews */}
            {(imageSelfie || imageEnv) && (
              <div className="mt-3 flex gap-2">
                {imageSelfie && (
                  <div className="relative">
                    <img src={imageSelfie} alt="Selfie" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      onClick={() => setImageSelfie('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                {imageEnv && (
                  <div className="relative">
                    <img src={imageEnv} alt="Environment" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      onClick={() => setImageEnv('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Location Button */}
          <div className="mb-6">
            <button
              onClick={handleLocation}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium"
            >
              🌍 Use my location for weather
            </button>
            {weather && (
                          <div className="mt-2 text-sm text-black">
              Weather: {weather.temp_c}°C, {weather.precip ? 'Rainy' : 'Clear'}, {weather.daylight ? 'Day' : 'Night'}
            </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Get My Care Quest'}
          </button>
        </div>
      </div>
      
      {/* Camera Sheet */}
      <CameraSheet
        open={cameraOpen}
        facing={cameraFacing}
        onClose={() => setCameraOpen(false)}
        onCaptured={handleCameraCapture}
      />
    </div>
  )
}
