#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { ensureActionsCollection, searchTopK } from '../src/lib/milvus';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testMilvus() {
  console.log('🧪 Testing Milvus connection...');
  
  try {
    // Test collection creation
    console.log('1. Testing collection creation...');
    await ensureActionsCollection();
    console.log('✅ Collection creation successful');
    
    // Test search with dummy vector
    console.log('2. Testing search functionality...');
    const dummyVector = new Array(1536).fill(0.1); // 1536-dimensional vector
    const results = await searchTopK(dummyVector, 3);
    console.log('✅ Search successful:', results);
    
    console.log('🎉 All Milvus tests passed!');
    
  } catch (error) {
    console.error('❌ Milvus test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMilvus()
  .then(() => {
    console.log('✅ Milvus connection test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Milvus connection test failed:', error);
    process.exit(1);
  });
