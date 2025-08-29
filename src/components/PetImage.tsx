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
    
    // Level 2 is hatchling (smaller version of the pet)
    if (pet.level === 2) {
      switch (pet.species) {
        case 'doggo':
          return '/pets/dog-beagle-2.png' // Using same image but smaller size
        case 'kitten':
          return '/pets/cat-graywhite.png' // Using same image but smaller size
        case 'dragon':
          return '/pets/dragon_red.PNG' // Using same image but smaller size
        default:
          return '/pets/egg_classic_full.png'
      }
    }
    
    // Level 3+ shows the full grown pet
    switch (pet.species) {
      case 'doggo':
        return '/pets/dog-beagle-2.png'
      case 'kitten':
        return '/pets/cat-graywhite.png'
      case 'dragon':
        return '/pets/dragon_red.PNG'
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
