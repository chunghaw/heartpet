'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeartPetLogo from '@/components/HeartPetLogo';

const PET_SPECIES = [
  { id: 'seedling_spirit', name: 'Seedling Spirit', description: 'A gentle plant companion that grows with your care' },
  { id: 'cloud_kitten', name: 'Cloud Kitten', description: 'A fluffy friend that floats on soft clouds' },
  { id: 'pocket_dragon', name: 'Pocket Dragon', description: 'A tiny dragon that fits in your pocket' }
];

const PET_COLORS = [
  { id: '#22c55e', name: 'Emerald Green', hex: '#22c55e' },
  { id: '#3b82f6', name: 'Ocean Blue', hex: '#3b82f6' },
  { id: '#f59e0b', name: 'Sunset Orange', hex: '#f59e0b' },
  { id: '#8b5cf6', name: 'Royal Purple', hex: '#8b5cf6' },
  { id: '#ec4899', name: 'Rose Pink', hex: '#ec4899' },
  { id: '#f43f5e', name: 'Coral Red', hex: '#f43f5e' }
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [petName, setPetName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePet = async () => {
    if (!petName.trim() || !selectedSpecies || !selectedColor) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: petName.trim(),
          species: selectedSpecies,
          color: selectedColor,
        }),
      });

      if (response.ok) {
        router.push('/'); // Go to main app
      } else {
        throw new Error('Failed to create pet');
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      alert('Failed to create pet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HeartPet!</h1>
          <p className="text-gray-700">Let's create your perfect companion</p>
        </div>

        {/* Pet Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            What's your pet's name?
          </label>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="Enter a name..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            maxLength={20}
          />
        </div>

        {/* Pet Species */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Choose your pet's species:
          </label>
          <div className="space-y-3">
            {PET_SPECIES.map((species) => (
              <div
                key={species.id}
                onClick={() => setSelectedSpecies(species.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSpecies === species.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{species.name}</div>
                <div className="text-sm text-gray-700">{species.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pet Color */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Pick your pet's color:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PET_COLORS.map((color) => (
              <div
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  selectedColor === color.id
                    ? 'border-gray-800'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-xs text-center text-gray-900 font-medium">{color.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreatePet}
          disabled={isCreating || !petName.trim() || !selectedSpecies || !selectedColor}
          className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating your pet...' : 'Create My Pet!'}
        </button>
      </div>
    </div>
  );
}
