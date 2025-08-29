#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function addMoreActions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Adding more diverse actions to reduce repetition...');
    
    const newActions = [
      // Physical Movement Actions
      {
        title: "Gentle Neck Stretches",
        steps: ["Sit comfortably", "Slowly tilt head left, hold 5 seconds", "Return to center, then tilt right", "Gently roll shoulders back 3 times"],
        seconds: 60,
        category: "Connect",
        tags: ["stretching", "neck", "tension_release", "indoor"],
        why: "Gentle neck stretches release tension and improve circulation to your brain."
      },
      {
        title: "Micro Desk Walk",
        steps: ["Stand up from your chair", "Walk around your desk 3 times", "Stretch arms overhead", "Return to chair with a deep breath"],
        seconds: 120,
        category: "Move",
        tags: ["walking", "indoor", "micro", "energy_boost"],
        why: "Short walks increase blood flow and can help clear mental fog."
      },
      {
        title: "Window Gazing Break",
        steps: ["Look out a window for 30 seconds", "Notice 3 things you haven't seen before", "Take 3 slow breaths", "Return to work refreshed"],
        seconds: 60,
        category: "Reset",
        tags: ["window_nature", "mindfulness", "micro_break", "indoor"],
        why: "Distance gazing reduces eye strain and gives your mind a gentle reset."
      },
      
      // Creative & Mental Actions
      {
        title: "Color Hunt",
        steps: ["Look around your space", "Find 5 objects of the same color", "Name each object silently", "Notice how this color makes you feel"],
        seconds: 90,
        category: "Creative",
        tags: ["observation", "creativity", "mindfulness", "indoor"],
        why: "Color hunting engages your creative mind and helps you notice details."
      },
      {
        title: "Micro Story Time",
        steps: ["Think of a happy memory", "Write 3 sentences about it", "Add one detail you haven't thought of before", "Smile at the memory"],
        seconds: 20,
        category: "Connect",
        tags: ["writing", "memory", "positive", "indoor"],
        why: "Recalling positive memories can boost mood and create a sense of connection."
      },
      
      // Sensory & Calming Actions
      {
        title: "Texture Exploration",
        steps: ["Find 3 different textures nearby", "Touch each one mindfully", "Notice temperature, roughness, softness", "Take a breath between each"],
        seconds: 60,
        category: "Soothe",
        tags: ["sensory", "mindfulness", "touch", "indoor"],
        why: "Sensory exploration grounds you in the present moment and can be calming."
      },
      {
        title: "Sound Mapping",
        steps: ["Close your eyes for 10 seconds", "Identify 5 different sounds", "Notice which direction they come from", "Open eyes and take a breath"],
        seconds: 60,
        category: "Reset",
        tags: ["listening", "mindfulness", "sensory", "indoor"],
        why: "Sound mapping helps you become more present and aware of your environment."
      },
      
      // Social & Connection Actions
      {
        title: "Gratitude Text",
        steps: ["Think of someone who helped you recently", "Send them a quick thank you message", "Be specific about what you appreciate", "Notice how it feels to express gratitude"],
        seconds: 120,
        category: "Connect",
        tags: ["social", "gratitude", "communication", "indoor"],
        why: "Expressing gratitude strengthens relationships and boosts your own happiness."
      },
      {
        title: "Micro Compliment",
        steps: ["Look at yourself in a mirror", "Give yourself one genuine compliment", "Say it out loud or in your head", "Hold that positive feeling"],
        seconds: 45,
        category: "Soothe",
        tags: ["self_care", "positive", "confidence", "indoor"],
        why: "Self-compassion is a powerful tool for emotional well-being."
      },
      
      // Energy & Focus Actions
      {
        title: "Power Pose",
        steps: ["Stand with feet apart", "Place hands on hips", "Lift chin slightly", "Hold for 30 seconds with confident breathing"],
        seconds: 60,
        category: "Energize",
        tags: ["posture", "confidence", "energy_boost", "indoor"],
        why: "Power poses can increase confidence and reduce stress hormones."
      },
      {
        title: "Focus Reset",
        steps: ["Close your eyes", "Count backwards from 10", "With each number, imagine a worry floating away", "Open eyes and take a focused breath"],
        seconds: 45,
        category: "Reset",
        tags: ["focus", "mindfulness", "mental_clearance", "indoor"],
        why: "Mental counting helps clear mental clutter and improve focus."
      }
    ];
    
    for (const action of newActions) {
      // Generate embedding for the action
      const textForEmbedding = `${action.title}\n${action.steps.join(' ')}\nwhy:${action.why}\ncategory:${action.category}\ntags:${action.tags.join(',')}`;
      
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textForEmbedding
      });
      
      const embeddingArray = embedding.data[0].embedding;
      
      // Insert action with tags (steps as JSON)
      await client.query(`
        INSERT INTO actions (title, steps, seconds, category, why, tags, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (title) DO UPDATE SET
          steps = EXCLUDED.steps,
          seconds = EXCLUDED.seconds,
          category = EXCLUDED.category,
          why = EXCLUDED.why,
          tags = EXCLUDED.tags,
          embedding = EXCLUDED.embedding
      `, [action.title, JSON.stringify(action.steps), action.seconds, action.category, action.why, action.tags, JSON.stringify(embeddingArray)]);
      
      console.log(`✅ Added: ${action.title}`);
    }
    
    console.log(`🎉 Successfully added ${newActions.length} new diverse actions!`);
    
  } catch (error) {
    console.error('❌ Error adding actions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
addMoreActions()
  .then(() => {
    console.log('🎉 Action addition complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Action addition failed:', error);
    process.exit(1);
  });
  
  const newActions = [
    // ——— PLAYFUL OUTDOOR / WINDOW-NATURE (brief) ———
    {
      title: "Leaf or Shadow Safari",
      steps: [
        "Step outside or stand by a bright window",
        "Spot 3 leaf shapes or shadow patterns",
        "Name 1 ‘creature’ you see in them"
      ],
      seconds: 45,
      category: "Reset",
      tags: ["outdoor","brief","nature","play","look_far"],
      why: "Fast nature-play shifts attention outward and refreshes mental state."
    },
    {
      title: "Doorway Rain Listening",
      steps: [
        "Stand under shelter at the door",
        "Close eyes 10s, map 3 rain sounds",
        "Long exhale once before heading back"
      ],
      seconds: 60,
      category: "Soothe",
      tags: ["outdoor","sheltered","rain_listen","sensory","fresh_air"],
      why: "Sheltered rain audio becomes a calming sensory anchor."
    },
    {
      title: "Window Light Bath",
      steps: [
        "Face a bright window",
        "Soften your gaze; blink slow ×5",
        "Inhale 4, exhale 6 ×3"
      ],
      seconds: 45,
      category: "Nourish",
      tags: ["indoor","window_nature","light","micro_break"],
      why: "Soft daylight and longer exhales gently lift alertness."
    },
    {
      title: "Green Dot Hunt",
      steps: [
        "Find 3 green things near you",
        "Name their shade (mint, moss, jade)",
        "Roll shoulders once"
      ],
      seconds: 60,
      category: "Reset",
      tags: ["outdoor","brief","window_nature","color","play"],
      why: "Color-spotting adds novelty and eases screen tunnel vision."
    },
    {
      title: "Balcony Breath Beat",
      steps: [
        "Step to balcony/doorway",
        "Tap a simple 1-2-3 pattern on your chest",
        "Match 4 breaths to that rhythm"
      ],
      seconds: 45,
      category: "Soothe",
      tags: ["outdoor","sheltered","rhythm","breath","fresh_air"],
      why: "Gentle rhythm with air flow calms without feeling serious."
    },
  
    // ——— EYES / BRAIN (not boring) ———
    {
      title: "Far-Focus Flip",
      steps: [
        "Look 15–20m away for 15s",
        "Then focus on your thumb for 5s",
        "Repeat 3 rounds"
      ],
      seconds: 60,
      category: "Eyes/Brain",
      tags: ["eye_relief","look_far","micro"],
      why: "Near–far focus switching relaxes eye muscles and clears fog."
    },
    {
      title: "Figure-8 Eye Glide",
      steps: [
        "Trace a sideways 8 with your eyes",
        "Small + slow ×4 each direction",
        "Relax jaw once"
      ],
      seconds: 60,
      category: "Eyes/Brain",
      tags: ["eye_relief","micro","desk"],
      why: "Smooth pursuits ease visual tension from screens."
    },
    {
      title: "Peripheral Pop",
      steps: [
        "Stare softly at a point",
        "Name 4 things in your side vision",
        "Blink slow ×5"
      ],
      seconds: 55,
      category: "Eyes/Brain",
      tags: ["attention","eye_relief","mindfulness"],
      why: "Widening attention reduces tunnel vision and stress."
    },
  
    // ——— MICRO-MOVEMENT (interesting) ———
    {
      title: "Shoulder Unshrug Game",
      steps: [
        "Inhale: shoulders up",
        "Exhale: drop + roll back (slow)",
        "Repeat 6 times; count backwards 6→1"
      ],
      seconds: 45,
      category: "Move",
      tags: ["neck","shoulder","movement","desk"],
      why: "Releasing elevated shoulders eases neck load and invites ease."
    },
    {
      title: "Calf-raise Ladder",
      steps: [
        "Rise on toes for 5 slow counts",
        "Down for 5; repeat ×5",
        "Shake ankles for 5s"
      ],
      seconds: 60,
      category: "Energize",
      tags: ["movement","legs","energy_boost","indoor"],
      why: "Lower-leg pumping boosts circulation and alertness quickly."
    },
    {
      title: "Doorframe Stretch",
      steps: [
        "Hands on doorframe at chest height",
        "Lean forward gently 20s",
        "Look left/right slowly"
      ],
      seconds: 65,
      category: "Move",
      tags: ["chest_open","posture","indoor"],
      why: "Opens chest after hunching, easing breath and focus."
    },
    {
      title: "Shake + Smile Reset",
      steps: [
        "Shake hands 10s, feet 10s",
        "Make a silly face 3s",
        "One steady breath"
      ],
      seconds: 45,
      category: "Energize",
      tags: ["play","movement","mood_lift","quick"],
      why: "Playful shaking breaks tension and brightens mood fast."
    },
    {
      title: "Desk Twist & Reach",
      steps: [
        "Sit tall; twist left 10s",
        "Twist right 10s",
        "Reach tall ×3"
      ],
      seconds: 60,
      category: "Move",
      tags: ["spine","movement","desk"],
      why: "Gentle spinal moves counter chair stiffness."
    },
  
    // ——— CREATIVE / PLAY (engaging) ———
    {
      title: "30-Second Doodle Swap",
      steps: [
        "Draw a tiny shape",
        "Turn it into something silly",
        "Add a title"
      ],
      seconds: 60,
      category: "Creative",
      tags: ["play","drawing","novelty","micro_break"],
      why: "Micro-creativity nudges the brain out of ruminative loops."
    },
    {
      title: "Pocket Haiku",
      steps: [
        "Write 3 lines: 5–7–5 beats",
        "About something you see now",
        "Read it once to yourself"
      ],
      seconds: 75,
      category: "Creative",
      tags: ["writing","mindfulness","observe"],
      why: "Tiny poetry reframes the moment with gentle focus."
    },
    {
      title: "Object Story",
      steps: [
        "Pick any object near you",
        "Invent a 2-sentence backstory",
        "Share it with your pet (or aloud)"
      ],
      seconds: 60,
      category: "Creative",
      tags: ["improv","play","story"],
      why: "A quick imaginative twist disrupts stress narratives."
    },
  
    // ——— SENSORY / SOOTHE (novel) ———
    {
      title: "Texture Trio",
      steps: [
        "Find 3 textures (soft/rough/cool)",
        "Touch each for 5s",
        "Exhale longer than inhale once"
      ],
      seconds: 60,
      category: "Soothe",
      tags: ["sensory","touch","grounding","indoor"],
      why: "Tactile variety anchors attention in the present."
    },
    {
      title: "Scent Snapshot",
      steps: [
        "Smell coffee/tea/soap",
        "Describe it in 3 words",
        "One slow exhale"
      ],
      seconds: 45,
      category: "Soothe",
      tags: ["sensory","scent","mindfulness"],
      why: "Scent cuts through mental noise and settles the mind."
    },
    {
      title: "5-4-3 Mini Scan",
      steps: [
        "See 5 shapes",
        "Feel 4 touches",
        "Hear 3 sounds"
      ],
      seconds: 45,
      category: "Reset",
      tags: ["sensory","grounding","mindfulness"],
      why: "A rapid sensory count interrupts spirals with structure."
    },
  
    // ——— TIDY / ENVIRONMENT (win fast) ———
    {
      title: "One-Surface Sweep",
      steps: [
        "Pick desk or nightstand",
        "Move items to 3 piles: keep/bin/later",
        "Stop at 60–90s"
      ],
      seconds: 60,
      category: "Tidy",
      tags: ["tidy","micro","organize","indoor"],
      why: "A small visible win reduces cognitive load."
    },
    {
      title: "Five-Item Homecoming",
      steps: [
        "Put 5 items back",
        "Release shoulders once",
        "Smile when done"
      ],
      seconds: 60,
      category: "Tidy",
      tags: ["tidy","micro","momentum"],
      why: "Tiny order creates forward momentum without overwhelm."
    },
  
    // ——— PRO-SOCIAL (tiny but potent) ———
    {
      title: "Thinking-of-You Ping",
      steps: [
        "Open messages",
        "Send 1 kind line to someone",
        "Add an emoji that fits"
      ],
      seconds: 60,
      category: "Connect",
      tags: ["prosocial","text","gratitude","indoor"],
      why: "Small outreach boosts belonging for both people."
    },
    {
      title: "Future-You Note",
      steps: [
        "Write 1 supportive sentence",
        "Schedule it to yourself later",
        "Take one steady breath"
      ],
      seconds: 60,
      category: "Connect",
      tags: ["self_compassion","planning","indoor"],
      why: "Friendly self-talk builds resilience for the next moment."
    },
  
    // ——— MUSIC / RHYTHM (non-breath) ———
    {
      title: "One-Song Wiggle",
      steps: [
        "Play 60–90s of any upbeat track",
        "Wiggle shoulders/hips freely",
        "End with a soft sigh"
      ],
      seconds: 60,
      category: "Energize",
      tags: ["music","movement","mood_lift","play"],
      why: "Micro-dance boosts chemistry and disrupts tension fast."
    },
    {
      title: "Clap Pattern",
      steps: [
        "Clap 1-2-3, pause",
        "Clap 1-2-3-4, pause",
        "Repeat twice and smile"
      ],
      seconds: 60,
      category: "Reset",
      tags: ["rhythm","play","energy","indoor"],
      why: "Simple rhythm regulates arousal and focuses attention."
    },
  
    // ——— MICRO CHOICE / CONTROL (agency) ———
    {
      title: "Two-Minute Power Start",
      steps: [
        "Pick the smallest next task",
        "Do only 60s of it",
        "Mark a tiny ✔"
      ],
      seconds: 60,
      category: "Reset",
      tags: ["agency","momentum","micro"],
      why: "Tiny starts create momentum without pressure."
    },
    {
      title: "Yes/No Coin Flip",
      steps: [
        "Name a small decision",
        "Flip a coin for fun",
        "Notice your gut reaction"
      ],
      seconds: 45,
      category: "Creative",
      tags: ["decision","play","agency"],
      why: "Playful randomness reveals preference and reduces stuckness."
    },
  
    // ——— HAND / WRIST / NECK (fresh angles) ———
    {
      title: "Wrist Wave",
      steps: [
        "Hands up, wave wrists slow ×10",
        "Stretch palm down/up 10s each",
        "Shake out 5s"
      ],
      seconds: 60,
      category: "Move",
      tags: ["wrist","forearm","desk","movement"],
      why: "Gentle mobility offsets typing/grip strain."
    },
    {
      title: "Neck Yes-No-Maybe",
      steps: [
        "Nod ‘yes’ tiny ×6",
        "Shake ‘no’ tiny ×6",
        "Tilt ‘maybe’ left/right"
      ],
      seconds: 60,
      category: "Move",
      tags: ["neck","tension_release","micro","safe_range"],
      why: "Small ranges cue safety and reduce guarding."
    },
  
    // ——— GRATITUDE / REFRAME (not sappy) ———
    {
      title: "Spark Note",
      steps: [
        "Write 7 words: ‘Today I liked…’",
        "Underline one word",
        "Keep it"
      ],
      seconds: 45,
      category: "Soothe",
      tags: ["gratitude","writing","reframe"],
      why: "Quick appreciation nudges mood without pressure."
    },
    {
      title: "Tiny Win Trophy",
      steps: [
        "Pick any tiny win from today",
        "Draw a 10-sec trophy for it",
        "Stick it on your desk"
      ],
      seconds: 60,
      category: "Creative",
      tags: ["celebration","play","confidence"],
      why: "Celebrating micro-wins reinforces progress loops."
    },
  
    // ——— FOCUS / RESET (novel) ———
    {
      title: "Single-Task Bubble",
      steps: [
        "Choose one micro action",
        "Put phone on DND for 60s",
        "Do only that—then stop"
      ],
      seconds: 60,
      category: "Reset",
      tags: ["focus","dnd","micro_boundary","indoor"],
      why: "Short boundaries reduce switching costs and calm the mind."
    },
    {
      title: "Breath-Free Calm (Count Game)",
      steps: [
        "Count 20 objects silently",
        "Each count: relax shoulders",
        "Finish with a soft smile"
      ],
      seconds: 60,
      category: "Soothe",
      tags: ["mindfulness","non_breath","grounding"],
      why: "Counting + release offers calm without breath focus."
    }
  ];
