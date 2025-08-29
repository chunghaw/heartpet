'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Pet } from '@/types';
import { LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import HeartPetLogo from '@/components/HeartPetLogo';
import PetImage from '@/components/PetImage';
import { HomeIntro } from '@/components/HomeIntro';
import { HowItWorks } from '@/components/HowItWorks';

export default function Home() {
  const { data: session, status } = useSession();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [showQuickCheckin, setShowQuickCheckin] = useState(false);
  const [quickCheckinText, setQuickCheckinText] = useState('');
  const [quickCheckinEmoji, setQuickCheckinEmoji] = useState(0);
  const [quickCheckinLoading, setQuickCheckinLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchPet();
    }
  }, [session]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const fetchPet = async () => {
    try {
      const response = await fetch('/api/pet');
      if (response.ok) {
        const data = await response.json();
        setPet(data.pet);
      } else if (response.status === 404) {
        // No pet found, redirect to onboarding
        router.push('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckin = async () => {
    if (!quickCheckinText.trim()) {
      alert('Please share how you\'re feeling');
      return;
    }

    setQuickCheckinLoading(true);
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickCheckinText.trim(),
          emoji: quickCheckinEmoji
        })
      });

      if (response.ok) {
        setQuickCheckinText('');
        setQuickCheckinEmoji(0);
        setShowQuickCheckin(false);
        alert('Check-in saved! 💝');
      } else {
        alert('Failed to save check-in. Please try again.');
      }
    } catch (error) {
      console.error('Quick check-in failed:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setQuickCheckinLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HeartPet...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartPetLogo className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">HeartPet</h1>
            <p className="text-gray-600">
              Adopt a personal pet that grows with your emotional wellness journey
            </p>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>{isSigningIn ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
          

          
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          {/* Google Sign In */}
          <button
            onClick={() => signIn('google')}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <HeartPetLogo className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">HeartPet</h1>
              {pet && (
                <p className="text-sm text-gray-500">{pet.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your pet...</p>
          </div>
        ) : pet ? (
          <div className="space-y-6">
            {/* Pet Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <PetImage pet={pet} size="lg" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</h2>
              <p className="text-gray-600 mb-4 capitalize">Level {pet.level || 1} • {pet.stage} • {pet.species}</p>
              
              {/* Hero Intro */}
              <HomeIntro petName={pet.name} />
              
              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>XP: {pet.xp}</span>
                  <span>Next: {pet.xpForNext || 10}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (pet.xp % (pet.xpForNext || 10)) / (pet.xpForNext || 10) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/checkin')}
                className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Check In & Care
              </button>
              
              <button 
                onClick={() => setShowQuickCheckin(true)}
                className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Quick Check In
              </button>
              
              <button 
                onClick={() => router.push('/collection')}
                className="w-full bg-white text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                View Collection
              </button>
            </div>
            
            {/* How It Works */}
            <HowItWorks />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No pet found.</p>
            <button 
              onClick={() => router.push('/onboarding')}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Create Your Pet
            </button>
          </div>
        )}
      </main>

      {/* Quick Check-in Modal */}
      {showQuickCheckin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Quick Check In</h2>
              <button
                onClick={() => setShowQuickCheckin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <textarea
                  value={quickCheckinText}
                  onChange={(e) => setQuickCheckinText(e.target.value)}
                  placeholder="I'm feeling..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood: {quickCheckinEmoji === -2 ? '😢' : quickCheckinEmoji === -1 ? '😕' : quickCheckinEmoji === 0 ? '😐' : quickCheckinEmoji === 1 ? '🙂' : '😊'}
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  value={quickCheckinEmoji}
                  onChange={(e) => setQuickCheckinEmoji(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😢</span>
                  <span>😕</span>
                  <span>😐</span>
                  <span>🙂</span>
                  <span>😊</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQuickCheckin(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickCheckin}
                  disabled={quickCheckinLoading || !quickCheckinText.trim()}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickCheckinLoading ? 'Saving...' : 'Save Check In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
