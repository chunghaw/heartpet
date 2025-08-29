#!/usr/bin/env node

import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { ensureActionsCollection, searchActions, testMilvusConnection } from '../src/lib/milvus';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testMilvusSearch() {
  try {
    console.log('🧪 Testing Milvus search end-to-end...');
    
    // Test connection
    console.log('1. Testing Milvus connection...');
    const isConnected = await testMilvusConnection();
    if (!isConnected) {
      throw new Error('❌ Milvus connection failed');
    }
    console.log('✅ Milvus connection successful');
    
    // Ensure collection exists
    console.log('2. Ensuring actions collection...');
    await ensureActionsCollection();
    console.log('✅ Actions collection ready');
    
    // Create a test embedding
    console.log('3. Creating test embedding...');
    const testText = "I'm feeling stressed and need to calm down";
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: testText
    });
    
    const testVector = embedding.data[0].embedding;
    console.log('✅ Test embedding created');
    
    // Search for similar actions
    console.log('4. Searching for similar actions...');
    const results = await searchActions(testVector, 3);
    
    console.log('✅ Search successful!');
    console.log(`Found ${results.length} similar actions:`);
    
    results.forEach((hit, i) => {
      console.log(`  ${i + 1}. Action ID: ${hit.action_id}`);
      console.log(`     Category: ${hit.category}`);
      console.log(`     Score: ${hit.score.toFixed(4)}`);
    });
    
    console.log('🎉 All Milvus tests passed!');
    
  } catch (error) {
    console.error('❌ Milvus test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMilvusSearch()
  .then(() => {
    console.log('🎉 Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
