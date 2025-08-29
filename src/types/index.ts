// User and Pet types
export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'seedling_spirit' | 'cloud_kitten' | 'pocket_dragon';
  color: string;
  size: 'sm' | 'md' | 'lg';
  breed?: string;
  stage: 'egg' | 'hatchling' | 'sproutling' | 'floof';
  xp: number;
  level?: number;
  xpForNext?: number;
  created_at: Date;
}

// Action and Quest types
export interface Action {
  id: string;
  title: string;
  steps: string[];
  seconds: number;
  category: string;
  why: string;
  embedding?: number[];
}

// Check-in and Analysis types
export interface CheckIn {
  id: string;
  user_id: string;
  text: string;
  emoji?: number;
  cues?: VisionCues;
  mood?: 'calm' | 'happy' | 'playful' | 'focused' | 'sensitive' | 'creative' | 'intense';
  energy?: 'low' | 'medium' | 'high';
  focus?: string[];
  red_flags: boolean;
  created_at: Date;
}

export interface VisionCues {
  lighting?: 'dim' | 'normal' | 'bright' | 'fluorescent' | 'daylight';
  desk_clutter?: 'low' | 'medium' | 'high';
  indoor_outdoor?: 'indoor' | 'outdoor';
  time_hint?: 'day' | 'night' | 'unknown';
}

export interface Weather {
  temp_c?: number;
  precip?: boolean;
  daylight?: boolean;
}

export interface AIAnalysis {
  empathy: string;
  question: string;
  mood: 'calm' | 'happy' | 'playful' | 'focused' | 'sensitive' | 'creative' | 'intense';
  energy: 'low' | 'medium' | 'high';
  focus: string[];
  red_flags: boolean;
  cues?: VisionCues;
}

export interface AIRecommendation {
  action_id: string;
  title: string;
  steps: string[];
  seconds: number;
  category: string;
  why: string;
  explain: {
    cos: number;
    weight: number;
    fit_energy: number;
    novelty: number;
  };
}

// Execution and Progress types
export interface Execution {
  id: string;
  user_id: string;
  pet_id: string;
  action_id: string;
  seconds: number;
  foreground_ratio: number;
  hold_confirm: boolean;
  completed: boolean;
  helpful?: boolean;
  created_at: Date;
}

export interface CategoryWeight {
  user_id: string;
  category: string;
  weight: number;
}

// Props and Collection types
export interface HabitatProp {
  id: string;
  key: string;
  label: string;
}

export interface PetProp {
  pet_id: string;
  prop_id: string;
  owned: boolean;
}

// API Request/Response types
export interface AnalyzeRequest {
  text: string;
  emoji?: number;
  imageSelfie?: string;
  imageEnv?: string;
  weather?: Weather;
}

export interface RecommendRequest {
  userId: string;
  text: string;
  mood: string;
  energy: string;
  focus: string[];
  cues?: VisionCues;
}

export interface CoachRequest {
  text: string;
  emoji?: number;
  imageSelfie?: string;
  imageEnv?: string;
  weather?: Weather;
}

export interface CompleteRequest {
  userId: string;
  petId: string;
  actionId: string;
  seconds: number;
  foreground_ratio: number;
  hold_confirm: boolean;
  completed: boolean;
  helpful?: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Utility types
export const RED_FLAG = /(suicide|kill myself|self[-\s]?harm|i want to die|chest pain|tight chest with pain|loss of (bladder|bowel))/i;

export const stageForXP = (xp: number): Pet['stage'] => 
  xp >= 150 ? "floof" : xp >= 100 ? "sproutling" : xp >= 50 ? "hatchling" : "egg";

export const score = (cos: number, cat: string, w: Map<string, number>, fit: number, nov: number) =>
  0.65 * cos + 0.25 * (w.get(cat) ?? 1) + 0.07 * fit + 0.03 * nov;
