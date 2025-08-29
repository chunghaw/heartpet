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
        seconds: 90,
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
        seconds: 120,
        category: "Connect",
        tags: ["writing", "memory", "positive", "indoor"],
        why: "Recalling positive memories can boost mood and create a sense of connection."
      },
      
      // Sensory & Calming Actions
      {
        title: "Texture Exploration",
        steps: ["Find 3 different textures nearby", "Touch each one mindfully", "Notice temperature, roughness, softness", "Take a breath between each"],
        seconds: 75,
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
