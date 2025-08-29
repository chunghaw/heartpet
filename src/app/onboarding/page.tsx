'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const PET_SPECIES = [
  { 
    id: 'doggo', 
    name: 'Doggo', 
    description: 'A loyal and energetic companion that loves to play and explore',
    image: '/pets/dog-beagle-2.png'
  },
  { 
    id: 'kitten', 
    name: 'Kitten', 
    description: 'A curious and playful friend that brings joy and comfort',
    image: '/pets/cat-graywhite.png'
  },
  { 
    id: 'dragon', 
    name: 'Dragon', 
    description: 'A magical and wise companion with a gentle heart',
    image: '/pets/dragon.riv'
  }
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [petName, setPetName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePet = async () => {
    if (!petName.trim() || !selectedSpecies) {
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
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 relative">
                    {species.image.endsWith('.riv') ? (
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">🐉</span>
                      </div>
                    ) : (
                      <Image
                        src={species.image}
                        alt={species.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{species.name}</div>
                    <div className="text-sm text-gray-700">{species.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreatePet}
          disabled={isCreating || !petName.trim() || !selectedSpecies}
          className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating your pet...' : 'Create My Pet!'}
        </button>
      </div>
    </div>
  );
}
