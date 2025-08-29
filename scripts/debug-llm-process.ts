#!/usr/bin/env node

import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { buildQuery } from '../src/lib/query';
import { weatherAffinity } from '../src/lib/weather-affinity';
import { COMPOSE_ACTION_SYSTEM } from '../src/lib/prompts';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function debugLLMProcess() {
  console.log('🧪 DEBUGGING LLM PROCESSING STEPS\n');
  
  // Simulate user input
  const userInput = {
    text: "I'm feeling stressed and overwhelmed with work",
    mood: "sensitive",
    energy: "low",
    focus: ["soothe", "connect"],
    cues: {
      temp_c: 22,
      precip: false,
      daylight: true,
      good_outdoor_brief: true,
      good_outdoor_sheltered: false,
      good_window_nature: true
    }
  };
  
  console.log('📥 USER INPUT:');
  console.log(JSON.stringify(userInput, null, 2));
  
  // Step 1: Build Query String
  console.log('\n🔍 STEP 1: BUILDING QUERY STRING');
  const query = buildQuery({
    text: userInput.text,
    mood: userInput.mood,
    energy: userInput.energy,
    focus: userInput.focus,
    cues: userInput.cues
  });
  console.log('Query for embedding:');
  console.log(query);
  
  // Step 2: Generate Embedding
  console.log('\n🔍 STEP 2: GENERATING EMBEDDING');
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  console.log(`✅ Generated embedding: ${embedding.data[0].embedding.length} dimensions`);
  
  // Step 3: Weather Affinity Calculation
  console.log('\n🔍 STEP 3: WEATHER AFFINITY CALCULATION');
  const sampleTags = ["outdoor", "brief", "nature", "indoor", "sheltered"];
  const affinity = weatherAffinity(sampleTags, userInput.cues);
  console.log(`Tags: ${sampleTags.join(', ')}`);
  console.log(`Weather cues: ${JSON.stringify(userInput.cues)}`);
  console.log(`Weather affinity score: ${affinity}`);
  
  // Step 4: LLM Analysis (Analyze API simulation)
  console.log('\n🔍 STEP 4: LLM ANALYSIS (ANALYZE API)');
  const analyzeSystem = `
You are a gentle companion with a playful, non-patronising voice.
1) Reflect feelings in ≤3 warm, non-clinical sentences.
2) Ask exactly one curious question.
3) Infer energy ("low"|"medium"|"high"), mood ("calm"|"happy"|"playful"|"focused"|"sensitive"|"creative"|"intense"),
   and focus tags (mix of care + movement, e.g., connect|tidy|nourish|soothe|reset|wrist/forearm|neck/shoulder|back/hip|eyes/brain|breath|energise).
4) If crisis or urgent medical risk → "red_flags": true.
Return STRICT JSON: { empathy, question, mood, energy, focus[], red_flags } only.
`.trim();

  const analyzeResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      { role: 'system', content: analyzeSystem },
      { role: 'user', content: `User says: "${userInput.text}"\n\nAnalyze this and respond with the JSON format specified.` }
    ]
  });
  
  console.log('🤖 LLM Analysis Response:');
  console.log(analyzeResponse.choices[0]?.message?.content);
  
  // Step 5: LLM Composition (Recommend API simulation)
  console.log('\n🔍 STEP 5: LLM COMPOSITION (RECOMMEND API)');
  const baseAction = {
    title: "Take 3 deep breaths",
    steps: ["Find a comfortable position", "Close your eyes", "Breathe in for 4 counts, hold for 4, exhale for 4"],
    seconds: 60,
    category: "Soothe",
    tags: ["breathing", "calm", "mindfulness"],
    why: "Deep breathing activates your parasympathetic nervous system, helping you feel calmer and more centered."
  };
  
  const composeInput = {
    base_action: baseAction.title,
    base_steps: baseAction.steps,
    context: `User feeling: ${userInput.mood}, energy: ${userInput.energy}, focus: ${userInput.focus.join(', ')}`,
    weather: userInput.cues
  };
  
  const composeResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      { role: 'system', content: COMPOSE_ACTION_SYSTEM },
      { role: 'user', content: JSON.stringify(composeInput) }
    ]
  });
  
  console.log('🤖 LLM Composition Response:');
  console.log(composeResponse.choices[0]?.message?.content);
  
  // Step 6: Scoring Breakdown
  console.log('\n🔍 STEP 6: SCORING BREAKDOWN');
  const scoring = {
    cosine_similarity: 0.85,
    category_weight: 1.0,
    energy_fit: 1.0, // low energy user + soothing action
    novelty: 0.9, // assuming not recently done
    weather_affinity: affinity,
    final_score: 0.85 * 0.65 + 1.0 * 0.25 + 1.0 * 0.07 + 0.9 * 0.03 + affinity
  };
  
  console.log('📊 Scoring Breakdown:');
  console.log(`  Cosine Similarity (65%): ${scoring.cosine_similarity}`);
  console.log(`  Category Weight (25%): ${scoring.category_weight}`);
  console.log(`  Energy Fit (7%): ${scoring.energy_fit}`);
  console.log(`  Novelty (3%): ${scoring.novelty}`);
  console.log(`  Weather Affinity: ${scoring.weather_affinity}`);
  console.log(`  Final Score: ${scoring.final_score.toFixed(3)}`);
  
  console.log('\n🎉 LLM Processing Debug Complete!');
}

// Run the debug
debugLLMProcess()
  .then(() => {
    console.log('\n✅ Debug completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
