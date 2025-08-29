import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node'

const DIM = 1536

export function getMilvus() {
  const url = process.env.MILVUS_URI!
  const username = process.env.MILVUS_USER!
  const password = process.env.MILVUS_PASSWORD!
  
  // Handle Zilliz Cloud serverless URLs
  let address = url
  if (url.includes('serverless.aws-eu-central-1.cloud.zilliz.com')) {
    // Extract the cluster identifier from the serverless URL
    address = url.replace('https://', '').replace('http://', '')
  } else {
    address = url.replace('https://', '').replace('http://', '')
  }
  
  return new MilvusClient({ 
    address,
    username,
    password,
    ssl: url.startsWith('https://')
  })
}

export const COLLECTION = process.env.MILVUS_COLLECTION || 'heartpet_actions'

export async function ensureActionsCollection() {
  try {
    const milvus = getMilvus()
    const cols = await milvus.showCollections()
    const exists = cols.data.find((c: any) => c.name === COLLECTION)
    
    if (!exists) {
      console.log('Creating Milvus collection...')
      await milvus.createCollection({
        collection_name: COLLECTION,
        fields: [
          { name: 'action_id', data_type: DataType.VarChar, is_primary_key: true, max_length: 64 },
          { name: 'category', data_type: DataType.VarChar, max_length: 64 },
          { name: 'embedding', data_type: DataType.FloatVector, type_params: { dim: String(DIM) } },
        ],
      })
      
      await milvus.createIndex({
        collection_name: COLLECTION,
        field_name: 'embedding',
        index_name: 'ivf_flat',
        extra_params: { 
          index_type: 'IVF_FLAT', 
          metric_type: 'COSINE', 
          params: JSON.stringify({ nlist: 128 }) 
        },
      })
      
      await milvus.loadCollection({ collection_name: COLLECTION })
      console.log('✅ Milvus collection created and loaded')
    } else {
      console.log('✅ Milvus collection already exists')
    }
  } catch (error) {
    console.error('❌ Failed to ensure Milvus collection:', error)
    throw error
  }
}

export async function upsertActionVector(rows: Array<{ action_id: string; category: string; embedding: number[] }>) {
  try {
    const milvus = getMilvus()
    await milvus.loadCollection({ collection_name: COLLECTION })
    
    await milvus.upsert({
      collection_name: COLLECTION,
      data: rows.map(r => ({ 
        action_id: r.action_id, 
        category: r.category, 
        embedding: r.embedding 
      })),
    })
    
    console.log(`✅ Upserted ${rows.length} vectors to Milvus`)
  } catch (error) {
    console.error('❌ Failed to upsert to Milvus:', error)
    throw error
  }
}

export async function searchTopK(embedding: number[], k = 8) {
  try {
    const milvus = getMilvus()
    await milvus.loadCollection({ collection_name: COLLECTION })
    
    const r = await milvus.search({
      collection_name: COLLECTION,
      vector: embedding,
      anns_field: 'embedding',
      output_fields: ['action_id', 'category'],
      params: { 
        metric_type: 'COSINE', 
        params: JSON.stringify({ nprobe: 16 }) 
      },
      limit: k,
    })
    
    const hits = (r.results || [])[0] || []
    return hits.map((h: any) => ({ 
      action_id: h.id, 
      category: h.fields.category, 
      score: h.score 
    }))
  } catch (error) {
    console.error('❌ Milvus search failed:', error)
    throw error
  }
}
