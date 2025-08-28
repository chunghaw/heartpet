import { Action } from '@/types';

// Care Quest categories with 3 items each
export const careQuests: Action[] = [
  // Connect category
  {
    id: 'connect-1',
    title: 'Send a Heart Message',
    steps: [
      'Think of someone who makes you smile',
      'Send them a quick "thinking of you" message',
      'Notice how it feels to reach out'
    ],
    seconds: 90,
    category: 'Connect',
    why: 'Connection nourishes both you and others'
  },
  {
    id: 'connect-2',
    title: 'Gratitude Check-in',
    steps: [
      'Name 3 things you appreciate right now',
      'Take a moment to really feel each one',
      'Let the gratitude settle in'
    ],
    seconds: 120,
    category: 'Connect',
    why: 'Gratitude shifts perspective and opens the heart'
  },
  {
    id: 'connect-3',
    title: 'Kind Self-Talk',
    steps: [
      'Notice your inner voice',
      'Replace any harsh words with gentle ones',
      'Speak to yourself like a dear friend'
    ],
    seconds: 60,
    category: 'Connect',
    why: 'Self-compassion is the foundation of wellbeing'
  },

  // Tidy category
  {
    id: 'tidy-1',
    title: 'Clear One Surface',
    steps: [
      'Pick one small area (desk, bedside table)',
      'Remove 3 things that don\'t belong',
      'Notice the sense of order'
    ],
    seconds: 90,
    category: 'Tidy',
    why: 'External order creates internal calm'
  },
  {
    id: 'tidy-2',
    title: 'Digital Declutter',
    steps: [
      'Close 5 browser tabs you don\'t need',
      'Delete 3 old photos from your camera roll',
      'Feel the digital space opening up'
    ],
    seconds: 120,
    category: 'Tidy',
    why: 'Digital clutter affects mental clarity'
  },
  {
    id: 'tidy-3',
    title: 'Mindful Folding',
    steps: [
      'Pick up one piece of clothing',
      'Fold it with full attention',
      'Appreciate the simple act of care'
    ],
    seconds: 60,
    category: 'Tidy',
    why: 'Mindful actions bring presence to daily tasks'
  },

  // Nourish category
  {
    id: 'nourish-1',
    title: 'Hydration Pause',
    steps: [
      'Pour yourself a glass of water',
      'Take 3 slow sips',
      'Feel the water nourishing your body'
    ],
    seconds: 60,
    category: 'Nourish',
    why: 'Hydration supports every cell in your body'
  },
  {
    id: 'nourish-2',
    title: 'Mindful Snack',
    steps: [
      'Choose a small, healthy snack',
      'Eat it slowly, noticing taste and texture',
      'Thank your body for the nourishment'
    ],
    seconds: 90,
    category: 'Nourish',
    why: 'Mindful eating connects you to your body\'s needs'
  },
  {
    id: 'nourish-3',
    title: 'Vitamin D Break',
    steps: [
      'Step outside for 2 minutes',
      'Feel the sun on your skin',
      'Take 3 deep breaths of fresh air'
    ],
    seconds: 120,
    category: 'Nourish',
    why: 'Sunlight and fresh air are natural mood boosters'
  },

  // Soothe category
  {
    id: 'soothe-1',
    title: 'Gentle Hand Massage',
    steps: [
      'Rub lotion or oil into your hands',
      'Massage each finger slowly',
      'Feel the tension releasing'
    ],
    seconds: 90,
    category: 'Soothe',
    why: 'Touch releases oxytocin and reduces stress'
  },
  {
    id: 'soothe-2',
    title: 'Calming Tea Ritual',
    steps: [
      'Brew a cup of herbal tea',
      'Hold the warm cup in both hands',
      'Sip slowly, feeling the warmth spread'
    ],
    seconds: 120,
    category: 'Soothe',
    why: 'Warmth and ritual create a sense of safety'
  },
  {
    id: 'soothe-3',
    title: 'Soft Music Moment',
    steps: [
      'Put on a calming song',
      'Close your eyes and just listen',
      'Let the music wash over you'
    ],
    seconds: 180,
    category: 'Soothe',
    why: 'Music can shift your nervous system state'
  },

  // Reset category
  {
    id: 'reset-1',
    title: 'Power Pose',
    steps: [
      'Stand with feet apart, hands on hips',
      'Take 3 deep breaths',
      'Feel your confidence growing'
    ],
    seconds: 60,
    category: 'Reset',
    why: 'Body posture affects brain chemistry and confidence'
  },
  {
    id: 'reset-2',
    title: 'Quick Walk',
    steps: [
      'Walk around your space for 2 minutes',
      'Notice how your body feels',
      'Let movement clear your mind'
    ],
    seconds: 120,
    category: 'Reset',
    why: 'Movement increases blood flow and mental clarity'
  },
  {
    id: 'reset-3',
    title: 'Fresh Start',
    steps: [
      'Splash cold water on your face',
      'Take 3 energizing breaths',
      'Feel refreshed and ready'
    ],
    seconds: 60,
    category: 'Reset',
    why: 'Cold water activates your nervous system'
  }
];

// MoveBloom micro-actions (body focus areas)
export const moveBloomActions: Action[] = [
  // Wrist/Forearm
  {
    id: 'wrist-1',
    title: 'Wrist Circles',
    steps: [
      'Hold your arms out in front',
      'Make gentle circles with your wrists',
      'Reverse direction after 10 circles'
    ],
    seconds: 60,
    category: 'Movement',
    why: 'Releases tension from typing and device use'
  },
  {
    id: 'wrist-2',
    title: 'Finger Stretches',
    steps: [
      'Spread your fingers wide',
      'Hold for 5 seconds',
      'Make fists, then release'
    ],
    seconds: 45,
    category: 'Movement',
    why: 'Improves circulation and reduces stiffness'
  },

  // Neck/Shoulder
  {
    id: 'neck-1',
    title: 'Neck Rolls',
    steps: [
      'Drop your chin to your chest',
      'Slowly roll your head in a circle',
      'Repeat in the opposite direction'
    ],
    seconds: 90,
    category: 'Movement',
    why: 'Relieves neck tension from screen time'
  },
  {
    id: 'neck-2',
    title: 'Shoulder Shrugs',
    steps: [
      'Lift your shoulders toward your ears',
      'Hold for 3 seconds',
      'Release and feel the tension drop'
    ],
    seconds: 60,
    category: 'Movement',
    why: 'Releases shoulder tension and stress'
  },

  // Back/Hip
  {
    id: 'back-1',
    title: 'Gentle Twist',
    steps: [
      'Sit with feet flat on the floor',
      'Twist slowly to one side',
      'Hold for 10 seconds, then switch'
    ],
    seconds: 120,
    category: 'Movement',
    why: 'Improves spinal mobility and digestion'
  },
  {
    id: 'back-2',
    title: 'Hip Circles',
    steps: [
      'Stand with hands on hips',
      'Make slow circles with your hips',
      'Change direction after 5 circles'
    ],
    seconds: 90,
    category: 'Movement',
    why: 'Releases hip tension from sitting'
  },

  // Eyes/Brain
  {
    id: 'eyes-1',
    title: 'Eye Rest',
    steps: [
      'Close your eyes for 20 seconds',
      'Place palms over eyes (no pressure)',
      'Let your eyes rest in darkness'
    ],
    seconds: 60,
    category: 'Rest',
    why: 'Gives your eyes a break from screens'
  },
  {
    id: 'eyes-2',
    title: 'Distance Focus',
    steps: [
      'Look at something 20 feet away',
      'Hold your gaze for 20 seconds',
      'Blink naturally'
    ],
    seconds: 45,
    category: 'Rest',
    why: 'Reduces eye strain from close work'
  },

  // Breath
  {
    id: 'breath-1',
    title: '4-7-8 Breathing',
    steps: [
      'Inhale for 4 counts',
      'Hold for 7 counts',
      'Exhale for 8 counts'
    ],
    seconds: 120,
    category: 'Breathing',
    why: 'Activates parasympathetic nervous system'
  },
  {
    id: 'breath-2',
    title: 'Box Breathing',
    steps: [
      'Inhale for 4 counts',
      'Hold for 4 counts',
      'Exhale for 4 counts',
      'Hold for 4 counts'
    ],
    seconds: 90,
    category: 'Breathing',
    why: 'Calms the mind and regulates stress response'
  },

  // Energize
  {
    id: 'energize-1',
    title: 'Quick Jump',
    steps: [
      'Stand with feet shoulder-width apart',
      'Do 10 gentle jumps',
      'Land softly on the balls of your feet'
    ],
    seconds: 60,
    category: 'Energize',
    why: 'Increases heart rate and circulation'
  },
  {
    id: 'energize-2',
    title: 'Arm Swings',
    steps: [
      'Stand with arms at your sides',
      'Swing arms forward and back',
      'Gradually increase the swing'
    ],
    seconds: 90,
    category: 'Energize',
    why: 'Wakes up your upper body and improves mood'
  }
];

export const allActions = [...careQuests, ...moveBloomActions];

export const actionCategories = [
  'Connect', 'Tidy', 'Nourish', 'Soothe', 'Reset', 
  'Movement', 'Rest', 'Breathing', 'Energize'
];
