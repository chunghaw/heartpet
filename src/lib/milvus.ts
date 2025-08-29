import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const DIM = 1536;

// ---------- Client ----------
export function getMilvus() {
  const url = process.env.MILVUS_URI;
  const username = process.env.MILVUS_USER;
  const password = process.env.MILVUS_PASSWORD;
  
  if (!url || !username || !password) {
    throw new Error('Missing Milvus environment variables: MILVUS_URI, MILVUS_USER, MILVUS_PASSWORD');
  }
  
  // Handle Zilliz Cloud serverless URLs
  let address: string;
  if (url.startsWith('https://')) {
    // Extract host from https://in03-85d251bbc78827a.serverless.aws-eu-central-1.cloud.zilliz.com
    const urlObj = new URL(url);
    address = urlObj.host;
  } else {
    address = url;
  }
  
  return new MilvusClient({ 
    address, 
    username, 
    password, 
    ssl: url.startsWith('https://') 
  });
}

// ---------- Collections ----------
export const ACTIONS_COLLECTION = "content_vectors";
export const MEM_COLLECTION = "user_memories";

// Create actions collection (PK + category + vector)
export async function ensureActionsCollection() {
  try {
    const m = getMilvus();
    const list = await m.showCollections();
    const exists = list.data.find((c: any) => c.name === ACTIONS_COLLECTION);
    
    if (!exists) {
      console.log(`Creating collection: ${ACTIONS_COLLECTION}`);
      await m.createCollection({
        collection_name: ACTIONS_COLLECTION,
        fields: [
          { name: "action_id", data_type: DataType.VarChar, is_primary_key: true, max_length: 64 },
          { name: "category", data_type: DataType.VarChar, max_length: 64 },
          { name: "embedding", data_type: DataType.FloatVector, type_params: { dim: String(DIM) } },
        ],
      });
      
      console.log(`Creating index for: ${ACTIONS_COLLECTION}`);
      await m.createIndex({
        collection_name: ACTIONS_COLLECTION,
        field_name: "embedding",
        index_name: "ivf_flat",
        extra_params: { 
          index_type: "IVF_FLAT", 
          metric_type: "COSINE", 
          params: JSON.stringify({ nlist: 128 }) 
        },
      });
    }
    
    await m.loadCollection({ collection_name: ACTIONS_COLLECTION });
    console.log(`✅ Collection ${ACTIONS_COLLECTION} ready`);
    return true;
  } catch (error) {
    console.error('❌ Failed to ensure actions collection:', error);
    throw error;
  }
}

// Create user memories collection (PK + user + note + ts + vector)
export async function ensureUserMemories() {
  try {
    const m = getMilvus();
    const list = await m.showCollections();
    const exists = list.data.find((c: any) => c.name === MEM_COLLECTION);
    
    if (!exists) {
      console.log(`Creating collection: ${MEM_COLLECTION}`);
      await m.createCollection({
        collection_name: MEM_COLLECTION,
        fields: [
          { name: "id", data_type: DataType.VarChar, is_primary_key: true, max_length: 64 },
          { name: "user_id", data_type: DataType.VarChar, max_length: 64 },
          { name: "note", data_type: DataType.VarChar, max_length: 512 },
          { name: "ts", data_type: DataType.Int64 },
          { name: "embedding", data_type: DataType.FloatVector, type_params: { dim: String(DIM) } },
        ],
      });
      
      console.log(`Creating index for: ${MEM_COLLECTION}`);
      await m.createIndex({
        collection_name: MEM_COLLECTION,
        field_name: "embedding",
        index_name: "ivf_flat",
        extra_params: { 
          index_type: "IVF_FLAT", 
          metric_type: "COSINE", 
          params: JSON.stringify({ nlist: 128 }) 
        },
      });
    }
    
    await m.loadCollection({ collection_name: MEM_COLLECTION });
    console.log(`✅ Collection ${MEM_COLLECTION} ready`);
    return true;
  } catch (error) {
    console.error('❌ Failed to ensure user memories collection:', error);
    throw error;
  }
}

// ---------- Upsert ----------
export async function upsertActionVector(rows: Array<{ action_id: string; category: string; embedding: number[] }>) {
  try {
    const m = getMilvus();
    await m.loadCollection({ collection_name: ACTIONS_COLLECTION });
    
    const data = rows.map(row => ({
      action_id: row.action_id,
      category: row.category,
      embedding: row.embedding
    }));
    
    await m.upsert({ 
      collection_name: ACTIONS_COLLECTION, 
      data: data 
    });
    
    console.log(`✅ Upserted ${rows.length} action vectors to Milvus`);
  } catch (error) {
    console.error('❌ Failed to upsert action vectors:', error);
    throw error;
  }
}

export async function upsertMemories(rows: Array<{ id: string; user_id: string; note: string; ts: number; embedding: number[] }>) {
  try {
    const m = getMilvus();
    await m.loadCollection({ collection_name: MEM_COLLECTION });
    
    const data = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      note: row.note,
      ts: row.ts,
      embedding: row.embedding
    }));
    
    await m.upsert({ 
      collection_name: MEM_COLLECTION, 
      data: data 
    });
    
    console.log(`✅ Upserted ${rows.length} memory vectors to Milvus`);
  } catch (error) {
    console.error('❌ Failed to upsert memory vectors:', error);
    throw error;
  }
}

// ---------- Search ----------
type Hit = { action_id: string; category: string; score: number };
export async function searchActions(embedding: number[], k = 8): Promise<Hit[]> {
  try {
    const m = getMilvus();
    await m.loadCollection({ collection_name: ACTIONS_COLLECTION });
    
    const r = await m.search({
      collection_name: ACTIONS_COLLECTION,
      vector: embedding,
      anns_field: "embedding",
      output_fields: ["action_id", "category"],
      params: { 
        metric_type: "COSINE", 
        params: JSON.stringify({ nprobe: 16 }) 
      },
      limit: k,
    });
    
    const hits = (r.results || [])[0] || [];
    return hits.map((h: any) => ({ 
      action_id: h.id, 
      category: h.fields.category, 
      score: h.score 
    }));
  } catch (error) {
    console.error('❌ Milvus search failed, falling back to Postgres:', error);
    throw error; // Let caller handle fallback
  }
}

export async function searchMemories(user_id: string, embedding: number[], k = 3) {
  try {
    const m = getMilvus();
    await m.loadCollection({ collection_name: MEM_COLLECTION });
    
    const r = await m.search({
      collection_name: MEM_COLLECTION,
      vector: embedding,
      anns_field: "embedding",
      output_fields: ["id", "note", "ts", "user_id"],
      filter: `user_id == "${user_id}"`,
      params: { 
        metric_type: "COSINE", 
        params: JSON.stringify({ nprobe: 16 }) 
      },
      limit: k,
    });
    
    const hits = (r.results || [])[0] || [];
    return hits.map((h: any) => ({ 
      id: h.id, 
      note: h.fields.note, 
      ts: h.fields.ts, 
      score: h.score 
    }));
  } catch (error) {
    console.error('❌ Milvus memory search failed:', error);
    return []; // Return empty for memories
  }
}

// ---------- Graceful Fallback Helpers ----------
export function isMilvusAvailable(): boolean {
  try {
    return !!(process.env.MILVUS_URI && process.env.MILVUS_USER && process.env.MILVUS_PASSWORD);
  } catch {
    return false;
  }
}

// Test connection
export async function testMilvusConnection(): Promise<boolean> {
  try {
    const m = getMilvus();
    await m.showCollections();
    return true;
  } catch (error) {
    console.error('❌ Milvus connection test failed:', error);
    return false;
  }
}
