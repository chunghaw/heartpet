#!/usr/bin/env node

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function seedActions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('Seeding enhanced actions with weather-aware tags...');
    
    const actions = [
      // Outdoor Brief Activities (sunny, pleasant weather)
      {
        title: "2-min Sunbeam Pause",
        steps: ["Step into a sunny spot", "Close eyes, feel warmth on face", "3 slow breaths: inhale 4, hold 2, exhale 6", "Return inside with a smile"],
        seconds: 120,
        category: "Nourish",
        tags: ["outdoor", "brief", "sunlight", "nature", "micro"],
        why: "Brief sunlight exposure boosts mood and vitamin D, while the breathing pattern calms your nervous system."
      },
      {
        title: "Leaf or Cloud Scan",
        steps: ["Step outside or by an open window", "Gently scan leaves/clouds for shapes", "Slow 3 breaths while looking far", "Return inside and note 1 pleasant detail"],
        seconds: 120,
        category: "Reset",
        tags: ["outdoor", "brief", "nature", "look_far", "micro"],
        why: "Distance gaze and a hint of nature lowers eye strain and resets attention."
      },
      {
        title: "Balcony Breath Reset",
        steps: ["Step onto balcony or near open door", "Place hands on belly", "4-7-8 breathing: inhale 4, hold 7, exhale 8", "Feel the fresh air for 3 rounds"],
        seconds: 180,
        category: "Soothe",
        tags: ["outdoor", "brief", "fresh_air", "breathing", "micro"],
        why: "Fresh air combined with extended exhales activates your parasympathetic nervous system for calm."
      },
      
      // Outdoor Sheltered Activities (rain, inclement weather)
      {
        title: "Doorway Rain Listening",
        steps: ["Stand under shelter (doorway/porch)", "Close eyes for 10s, notice rain patterns", "Slow exhale for a count of 6 (×5)", "Dry off hands and return"],
        seconds: 120,
        category: "Soothe",
        tags: ["outdoor", "sheltered", "rain_listen", "doorway", "fresh_air"],
        why: "Gentle sensory focus with rain sounds calms and refreshes."
      },
      {
        title: "Porch Fresh-Air 4-7-8",
        steps: ["Stand in doorway or covered area", "Feel the temperature difference", "4-7-8 breathing: inhale 4, hold 7, exhale 8", "Notice how air feels on your skin"],
        seconds: 150,
        category: "Connect",
        tags: ["outdoor", "sheltered", "fresh_air", "breathing", "micro"],
        why: "Temperature contrast and fresh air help you reconnect with your body and surroundings."
      },
      
      // Window Nature Activities (poor weather)
      {
        title: "Window Light Bath",
        steps: ["Stand near a bright window", "Tip chin down slightly to soften eyes", "3 rounds: inhale 4, exhale 6", "Name one thing you appreciate"],
        seconds: 90,
        category: "Nourish",
        tags: ["indoor", "window_nature", "light", "micro_break"],
        why: "Soft daylight and longer exhales can lift energy without going outside."
      },
      {
        title: "Soft Gaze at Distance (20-20-20)",
        steps: ["Look at something 20 feet away for 20 seconds", "Blink slowly 3 times", "Return to close work", "Repeat 2 more times"],
        seconds: 120,
        category: "Reset",
        tags: ["indoor", "window_nature", "eye_care", "micro_break"],
        why: "Distance gazing reduces eye strain and gives your focus a gentle reset."
      },
      
      // Indoor Activities (any weather)
      {
        title: "Take 3 deep breaths",
        steps: ["Find a comfortable position", "Close your eyes", "Breathe in for 4 counts, hold for 4, exhale for 4"],
        seconds: 60,
        category: "Soothe",
        tags: ["indoor", "breathing", "calm", "mindfulness"],
        why: "Deep breathing activates your parasympathetic nervous system, helping you feel calmer and more centered."
      },
      {
        title: "Stretch your arms overhead",
        steps: ["Stand up straight", "Reach arms overhead", "Hold for 10 seconds", "Slowly lower arms"],
        seconds: 90,
        category: "Connect",
        tags: ["indoor", "stretching", "movement", "tension_release"],
        why: "Simple stretching releases muscle tension and helps you reconnect with your body."
      },
      {
        title: "Drink a glass of water",
        steps: ["Get a glass of water", "Sip slowly and mindfully", "Feel the water hydrating your body"],
        seconds: 120,
        category: "Nourish",
        tags: ["indoor", "hydration", "health", "self_care"],
        why: "Hydration supports both physical and mental clarity, and taking a moment to drink mindfully can be grounding."
      },
      {
        title: "Micro Desk Tidy",
        steps: ["Look at your immediate workspace", "Pick up 3 items and put them away", "Wipe surface with a cloth", "Take a satisfied breath"],
        seconds: 150,
        category: "Tidy",
        tags: ["indoor", "organize", "micro", "satisfaction"],
        why: "Small organizing tasks create immediate visual satisfaction and can help clear mental clutter."
      },
      {
        title: "Gentle Neck Rolls",
        steps: ["Sit comfortably", "Slowly roll head left 3 times", "Roll right 3 times", "Finish with chin to chest stretch"],
        seconds: 120,
        category: "Connect",
        tags: ["indoor", "stretching", "neck", "tension_release"],
        why: "Gentle neck movements release tension and improve circulation to your brain."
      },
      {
        title: "Mindful Tea Moment",
        steps: ["Boil water mindfully", "Watch steam rise", "Sip slowly, notice temperature", "Feel warmth spread"],
        seconds: 180,
        category: "Nourish",
        tags: ["indoor", "mindfulness", "warmth", "ritual"],
        why: "Creating a mindful ritual around simple tasks helps you slow down and find peace in the present moment."
      }
    ];
    
    for (const action of actions) {
      // Generate embedding for the action
      const textForEmbedding = `${action.title}\n${action.steps.join(' ')}\nwhy:${action.why}\ncategory:${action.category}\ntags:${action.tags.join(',')}`;
      
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textForEmbedding
      });
      
      const embeddingArray = embedding.data[0].embedding;
      
      // Insert action with tags
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
      `, [action.title, action.steps, action.seconds, action.category, action.why, action.tags, embeddingArray]);
    }
    
    console.log(`✅ Successfully seeded ${actions.length} enhanced actions with weather-aware tags!`);
    
  } catch (error) {
    console.error('❌ Error seeding actions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedActions()
  .then(() => {
    console.log('🎉 Action seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Action seeding failed:', error);
    process.exit(1);
  });
