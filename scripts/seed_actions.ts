/* scripts/seed-actions.ts
 * Seeds 30+ creative micro-actions (outdoor / sheltered / window-nature / indoor)
 * into Postgres and Milvus. Uses OpenAI embeddings for retrieval.
 */

import 'dotenv/config';
import crypto from 'node:crypto';
import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

// Adjust the relative import if your path differs:
import { ensureActionsCollection, upsertActionVector } from '../src/lib/milvus';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function reqEnv(key: string) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

// Sanity check envs
reqEnv('OPENAI_API_KEY');
reqEnv('VERCEL_POSTGRES_URL');
reqEnv('MILVUS_URL');
reqEnv('MILVUS_TOKEN');

// Ensure actions table has 'why' and 'tags' columns
async function ensureColumns() {
  await sql`ALTER TABLE actions ADD COLUMN IF NOT EXISTS why text;`;
  // tags used for weather-aware retrieval; safe default empty array
  await sql`ALTER TABLE actions ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];`;
}

// Types
type SeedAction = {
  id?: string;
  title: string;
  steps: string[];
  seconds: number; // 60..180
  category:
    | 'connect'
    | 'tidy'
    | 'nourish'
    | 'soothe'
    | 'reset'
    | 'wrist/forearm'
    | 'neck/shoulder'
    | 'back/hip'
    | 'eyes/brain'
    | 'breath'
    | 'energise';
  tags: string[]; // e.g. ['outdoor','brief','window_nature','sheltered',...]
  why: string;
};

// ====== DATA ======
const A: SeedAction[] = [
  // --- Outdoor brief (1–3 min; sunlight / nature / look-far) ---
  {
    title: 'Sunbeam Pause',
    steps: [
      'Step outside or near open light',
      'Soften your gaze and notice warmth',
      'Inhale for 4, exhale for 6 (×4 rounds)',
      'Name 1 pleasant detail before returning',
    ],
    seconds: 90,
    category: 'reset',
    tags: ['outdoor', 'brief', 'sunlight', 'nature', 'look_far'],
    why: 'A short dose of daylight and longer exhales can reset attention and mood quickly.',
  },
  {
    title: 'Leaf or Cloud Scan',
    steps: [
      'Stand outside or by an open window',
      'Scan leaves or clouds for shapes for 60s',
      'Relax shoulders and jaw once',
      'Return inside and note one new detail',
    ],
    seconds: 120,
    category: 'soothe',
    tags: ['outdoor', 'brief', 'nature', 'look_far', 'micro'],
    why: 'Distance gaze and gentle novelty reduce eye strain and calm the nervous system.',
  },
  {
    title: 'Micro Nature Hunt',
    steps: [
      'Step outside and find 3 tiny textures (bark, leaf, stone)',
      'Touch one surface mindfully for 5s',
      'Take 3 slow breaths, shoulders down',
    ],
    seconds: 120,
    category: 'nourish',
    tags: ['outdoor', 'brief', 'nature', 'grounding', 'sensory'],
    why: 'Touch + nature cues anchor attention and provide a brief restorative break.',
  },
  {
    title: 'Shadow Shapes Game',
    steps: [
      'Step into light and find two shadows',
      'Trace a shape with your finger in the air',
      'Inhale 4, exhale 6 while tracing (×3)',
    ],
    seconds: 75,
    category: 'reset',
    tags: ['outdoor', 'brief', 'play', 'sunlight'],
    why: 'Playful micro-movements with paced breathing boost energy while staying gentle.',
  },
  {
    title: 'Two-Minute Sky Check-in',
    steps: [
      'Go outside or at an open window',
      'Look far into the sky line for 20s',
      'Blink slowly 5× and roll shoulders once',
    ],
    seconds: 90,
    category: 'eyes/brain',
    tags: ['outdoor', 'brief', 'look_far', 'eye_relief'],
    why: 'Far focusing relaxes ciliary muscles and eases screen-induced eye tension.',
  },

  // --- Outdoor sheltered (doorway / porch / rain listen) ---
  {
    title: 'Doorway Rain Listening',
    steps: [
      'Stand under shelter (doorway/porch)',
      'Close eyes 10s and notice rain patterns',
      'Exhale longer than inhale (×5 cycles)',
    ],
    seconds: 120,
    category: 'soothe',
    tags: ['outdoor', 'sheltered', 'rain_listen', 'doorway', 'fresh_air'],
    why: 'Rain sound and fresh air provide calming sensory input without getting wet.',
  },
  {
    title: 'Porch Fresh-Air 4-7-8',
    steps: [
      'Find a sheltered spot',
      'Inhale 4, hold 7, exhale 8 (×4)',
      'Scan shoulders and release once',
    ],
    seconds: 120,
    category: 'breath',
    tags: ['outdoor', 'sheltered', 'fresh_air', 'paced_breath'],
    why: 'Longer exhales + cool air increase vagal tone and relaxation.',
  },
  {
    title: 'Threshold Gratitude',
    steps: [
      'Stand at the door threshold',
      'Notice 3 sounds or sights',
      'Say one short phrase of thanks (silently)',
    ],
    seconds: 75,
    category: 'connect',
    tags: ['outdoor', 'sheltered', 'gratitude', 'doorway'],
    why: 'A brief ritual at the threshold reinforces calm and social connection.',
  },

  // --- Window-nature (indoor but nature/light-attuned) ---
  {
    title: 'Window Light Bath',
    steps: [
      'Stand near a bright window',
      'Tip chin slightly down to soften eyes',
      '3 rounds: inhale 4, exhale 6',
    ],
    seconds: 90,
    category: 'nourish',
    tags: ['indoor', 'window_nature', 'light', 'micro_break'],
    why: 'Ambient light through a window elevates alertness without full outdoor exposure.',
  },
  {
    title: '20-20-20 Soft Gaze',
    steps: [
      'Look 20 ft away for 20s',
      'Blink slowly 10×',
      'Palming for 10s if comfortable',
    ],
    seconds: 60,
    category: 'eyes/brain',
    tags: ['indoor', 'window_nature', 'look_far', 'eye_relief'],
    why: 'Eye muscles recover with periodic distance viewing and gentle darkness.',
  },
  {
    title: 'Indoor Nature Micro-Tour',
    steps: [
      'Find one plant, wood grain, or stone',
      'Trace its outline with your eyes',
      'Take 3 slow breaths while noticing texture',
    ],
    seconds: 75,
    category: 'soothe',
    tags: ['indoor', 'window_nature', 'nature', 'sensory'],
    why: 'Natural textures indoors still provide restorative attention.',
  },

  // --- Neutral indoor (tidy / hydrate / short movement) ---
  {
    title: 'Clear One Surface',
    steps: ['Pick desk or nightstand', 'Set a 90s timer', 'Move items to “keep / bin / later” piles'],
    seconds: 90,
    category: 'tidy',
    tags: ['indoor', 'tidy', 'micro', 'organize'],
    why: 'A contained tidy win reduces cognitive load and builds momentum.',
  },
  {
    title: 'Five-Item Reset',
    steps: ['Put 5 things back to their home', 'One deep breath between items', 'Smile when done'],
    seconds: 75,
    category: 'tidy',
    tags: ['indoor', 'tidy', 'micro'],
    why: 'Tiny structure restores a sense of control without overwhelm.',
  },
  {
    title: 'Water First',
    steps: ['Pour a full glass', 'Slow sip, count 10', 'Stretch tall once'],
    seconds: 60,
    category: 'nourish',
    tags: ['indoor', 'hydrate', 'micro'],
    why: 'Hydration and posture lift energy with minimal effort.',
  },
  {
    title: 'Cut Fruit / Snack Bowl',
    steps: ['Rinse fruit', 'Slice or assemble a small bowl', 'Pause for 3 breaths before eating'],
    seconds: 120,
    category: 'nourish',
    tags: ['indoor', 'food_prep', 'micro'],
    why: 'A quick, colorful snack stabilizes energy and mood.',
  },
  {
    title: 'Open Window + Stretch ×5',
    steps: ['Open a window or imagine cool air', 'Reach tall 5× slowly', 'Roll shoulders 5×'],
    seconds: 90,
    category: 'reset',
    tags: ['indoor', 'window_nature', 'stretch', 'micro'],
    why: 'Fresh airflow and gentle movement wake up the body quickly.',
  },

  // --- Connect (pro-social micro-steps) ---
  {
    title: 'Thinking-of-You Text',
    steps: ['Open messages', 'Write one kind sentence to a friend', 'Hit send'],
    seconds: 60,
    category: 'connect',
    tags: ['indoor', 'prosocial', 'text'],
    why: 'Small social bids increase belonging and positive affect.',
  },
  {
    title: 'Plan a 10-min Check-in',
    steps: ['Pick a friend', 'Suggest a short weekend call', 'Offer 2 time options'],
    seconds: 120,
    category: 'connect',
    tags: ['indoor', 'prosocial', 'schedule'],
    why: 'Scheduling a time reduces hesitation and builds commitment.',
  },

  // --- Breath & soothe ---
  {
    title: 'Box Breathing 4×4',
    steps: ['Inhale 4', 'Hold 4', 'Exhale 4', 'Hold 4 (×4 rounds)'],
    seconds: 90,
    category: 'breath',
    tags: ['indoor', 'soothe', 'paced_breath'],
    why: 'Even counts balance the nervous system and focus attention.',
  },
  {
    title: '4-7-8 Calm',
    steps: ['Inhale 4', 'Hold 7', 'Exhale 8 (×4)'],
    seconds: 120,
    category: 'breath',
    tags: ['indoor', 'soothe', 'paced_breath'],
    why: 'Longer exhale increases parasympathetic activation.',
  },
  {
    title: 'Gratitude Sentence',
    steps: ['Write one sentence starting “Right now I appreciate…”', 'Read it once aloud'],
    seconds: 60,
    category: 'soothe',
    tags: ['indoor', 'gratitude', 'reflect'],
    why: 'Brief gratitude broadens attention and softens stress.',
  },

  // --- MoveBloom micro-actions (body focus) ---
  {
    title: 'Wrist Flexor Reset',
    steps: ['Extend arm, palm up', 'Gently pull fingers down 15s', 'Switch sides'],
    seconds: 90,
    category: 'wrist/forearm',
    tags: ['indoor', 'movement', 'desk'],
    why: 'Releases forearm tension from typing and phone grip.',
  },
  {
    title: 'Shoulder Unshrug',
    steps: ['Inhale, lift shoulders to ears', 'Exhale, drop and roll back (×6)'],
    seconds: 90,
    category: 'neck/shoulder',
    tags: ['indoor', 'movement', 'desk'],
    why: 'Relieves neck/shoulder load and opens chest.',
  },
  {
    title: 'Chair Back Extension',
    steps: ['Place hands on low back', 'Gently press hips forward, look slightly up', 'Breathe 3 slow breaths'],
    seconds: 60,
    category: 'back/hip',
    tags: ['indoor', 'movement', 'desk'],
    why: 'Counters flexed sitting posture and wakes lumbar support.',
  },
  {
    title: 'Eye Palming',
    steps: ['Rub palms warm', 'Cup over closed eyes 20–30s', 'Relax jaw'],
    seconds: 60,
    category: 'eyes/brain',
    tags: ['indoor', 'eye_relief', 'micro'],
    why: 'Dark warmth relaxes eye muscles and quiets visual input.',
  },
  {
    title: 'Energising Breath 20s',
    steps: ['Sit tall', 'Short gentle inhales through nose 20s', 'Return to normal breath'],
    seconds: 60,
    category: 'energise',
    tags: ['indoor', 'energy', 'breath'],
    why: 'Brief fast inhales increase alertness safely when done gently.',
  },
  {
    title: 'Two-Minute Dance Reset',
    steps: ['Play a favourite upbeat track', 'Move however feels good', 'End with deep breath'],
    seconds: 120,
    category: 'energise',
    tags: ['indoor', 'music', 'movement', 'play'],
    why: 'Unstructured movement boosts mood and circulation rapidly.',
  },

  // --- More outdoor/hybrid for creativity ---
  {
    title: 'Fence or Tree Touch',
    steps: ['Step outside and touch a stable surface', 'Notice texture for 10s', 'Three slow breaths'],
    seconds: 75,
    category: 'reset',
    tags: ['outdoor', 'brief', 'grounding', 'nature'],
    why: 'Grounding contact with the environment calms body maps.',
  },
  {
    title: 'Balcony Breath Reset',
    steps: ['Stand on balcony/near open door', 'Inhale 4, exhale 6 (×5)', 'Name one outdoor scent'],
    seconds: 120,
    category: 'breath',
    tags: ['outdoor', 'sheltered', 'fresh_air'],
    why: 'Sheltered fresh air plus longer exhale is a safe, quick calmer.',
  },
  {
    title: 'Neighbourhood Sound Map',
    steps: ['Stand still for 60s', 'Count 5 different sounds', 'Exhale long once'],
    seconds: 90,
    category: 'soothe',
    tags: ['outdoor', 'brief', 'sensory', 'mindful'],
    why: 'Labeling sounds turns noise into mindful input, lowering stress reactivity.',
  },
  {
    title: 'Green Dot Hunt',
    steps: ['Outside or at window, find 3 green things', 'Name their shades', 'One slow shoulder roll'],
    seconds: 80,
    category: 'reset',
    tags: ['outdoor', 'brief', 'window_nature', 'play', 'look_far'],
    why: 'Color spotting engages the visual system and shifts attention outward.',
  },
  {
    title: 'Kindness Ping',
    steps: ['Send one kind emoji or sticker', 'Add 3 words of encouragement', 'Hit send'],
    seconds: 60,
    category: 'connect',
    tags: ['indoor', 'prosocial', 'text'],
    why: 'Tiny outreach increases perceived support and connection.',
  },
];

// ====== INSERT + EMBED ======

async function upsertAction(a: SeedAction) {
  const id = a.id ?? crypto.randomUUID();

  await sql`
    INSERT INTO actions (id, title, steps, seconds, category, why, tags)
    VALUES (${id}, ${a.title}, ${a.steps}, ${a.seconds}, ${a.category}, ${a.why}, ${a.tags})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      steps = EXCLUDED.steps,
      seconds = EXCLUDED.seconds,
      category = EXCLUDED.category,
      why = EXCLUDED.why,
      tags = EXCLUDED.tags
  `;

  // Build rich text for embedding
  const toEmbed = `${a.title}\n${a.steps.join(' ')}\nwhy:${a.why}\ncategory:${a.category}\ntags:${a.tags.join(',')}`;
  const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: toEmbed });
  const vector = emb.data[0].embedding;

  // Upsert vector to Milvus
  await upsertActionVector([{ action_id: id, category: a.category, embedding: vector }]);

  return id;
}

async function main() {
  console.log('→ Ensuring columns…');
  await ensureColumns();

  console.log('→ Ensuring Milvus collection…');
  await ensureActionsCollection();

  console.log(`→ Seeding ${A.length} actions…`);
  let i = 0;
  for (const a of A) {
    i++;
    const id = await upsertAction(a);
    console.log(`  [${i}/${A.length}] ${a.title} (${id})`);
  }

  console.log('✅ Seed complete.');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});