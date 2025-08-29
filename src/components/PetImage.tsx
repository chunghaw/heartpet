'use client'

import Image from 'next/image'
import { Pet } from '@/types'

interface PetImageProps {
  pet: Pet
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PetImage({ pet, size = 'md', className = '' }: PetImageProps) {
  const getPetImage = () => {
    // Level 1 is always egg
    if (pet.level === 1) {
      return '/pets/egg_classic_full.png'
    }
    
    // Level 2+ shows the actual pet
    switch (pet.species) {
      case 'doggo':
        return '/pets/dog-beagle-2.png'
      case 'kitten':
        return '/pets/cat-graywhite.png'
      case 'dragon':
        return '/pets/dragon.riv'
      default:
        return '/pets/egg_classic_full.png'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8'
      case 'md':
        return 'w-16 h-16'
      case 'lg':
        return 'w-32 h-32'
      default:
        return 'w-16 h-16'
    }
  }

  const imageSrc = getPetImage()
  const isRive = imageSrc.endsWith('.riv')

  if (isRive) {
    // For Rive files, we'll use a placeholder for now
    // TODO: Implement Rive player
    return (
      <div className={`${getSizeClasses()} bg-green-100 rounded-full flex items-center justify-center ${className}`}>
        <span className="text-green-600 font-bold text-xs">🐉</span>
      </div>
    )
  }

  return (
    <div className={`${getSizeClasses()} relative ${className}`}>
      <Image
        src={imageSrc}
        alt={`${pet.name} the ${pet.species}`}
        width={size === 'sm' ? 32 : size === 'md' ? 64 : 128}
        height={size === 'sm' ? 32 : size === 'md' ? 64 : 128}
        className="rounded-full object-cover"
      />
    </div>
  )
}
