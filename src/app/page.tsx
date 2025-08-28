'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Pet } from '@/types';
import { Heart, LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchPet();
    }
  }, [session]);

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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HeartPet</h1>
          <p className="text-gray-600 mb-8">
            Adopt a personal pet that grows with your emotional wellness journey
          </p>
          
          <button
            onClick={() => signIn('google')}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
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
              <Heart className="w-5 h-5 text-green-600" />
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
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-16 h-16 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</h2>
              <p className="text-gray-600 mb-4 capitalize">{pet.stage} • {pet.species.replace('_', ' ')}</p>
              
              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>XP: {pet.xp}</span>
                  <span>Next: {pet.stage === 'egg' ? 50 : pet.stage === 'hatchling' ? 100 : pet.stage === 'sproutling' ? 150 : 'Max'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${pet.stage === 'egg' ? (pet.xp / 50) * 100 : 
                              pet.stage === 'hatchling' ? (pet.xp - 50) / 50 * 100 :
                              pet.stage === 'sproutling' ? (pet.xp - 100) / 50 * 100 : 100}%` 
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
              
              <button className="w-full bg-white text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                View Collection
              </button>
            </div>
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
    </div>
  );
}
