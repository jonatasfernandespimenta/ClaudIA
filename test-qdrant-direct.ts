import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createId } from '@paralleldrive/cuid2';
import dotenv from 'dotenv';

dotenv.config();

async function testQdrantDirect() {
  console.log('🧪 Testando Qdrant diretamente...\n');
  
  const client = new QdrantClient({ url: 'http://localhost:6333' });
  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com Qdrant...');
    const collections = await client.getCollections();
    console.log(`✅ Conectado! Collections: ${collections.collections.map(c => c.name).join(', ')}\n`);
    
    // 2. Gerar embedding
    console.log('2️⃣ Gerando embedding de teste...');
    const testText = 'TypeScript é uma linguagem de programação';
    const vector = await embeddings.embedQuery(testText);
    console.log(`✅ Embedding gerado! Dimensões: ${vector.length}\n`);
    
    // 3. Testar upsert com CUID
    console.log('3️⃣ Testando upsert com CUID...');
    const cuidId = createId();
    console.log(`ID (CUID): ${cuidId}`);
    
    try {
      await client.upsert('claudia_knowledge', {
        points: [
          {
            id: cuidId,
            vector: vector,
            payload: {
              content: testText,
              originalContent: testText,
              category: 'test',
              timestamp: new Date().toISOString(),
              metadata: { source: 'test' },
            },
          },
        ],
      });
      console.log('✅ Upsert com CUID funcionou!\n');
    } catch (error) {
      console.error('❌ Erro no upsert com CUID:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2), '\n');
    }
    
    // 4. Testar upsert com UUID
    console.log('4️⃣ Testando upsert com número...');
    const numId = Date.now();
    console.log(`ID (número): ${numId}`);
    
    try {
      await client.upsert('claudia_knowledge', {
        points: [
          {
            id: numId,
            vector: vector,
            payload: {
              content: testText + ' (número)',
              originalContent: testText,
              category: 'test',
              timestamp: new Date().toISOString(),
              metadata: { source: 'test' },
            },
          },
        ],
      });
      console.log('✅ Upsert com número funcionou!\n');
    } catch (error) {
      console.error('❌ Erro no upsert com número:', error, '\n');
    }
    
    // 5. Verificar pontos inseridos
    console.log('5️⃣ Verificando pontos na collection...');
    const collectionInfo = await client.getCollection('claudia_knowledge');
    console.log(`✅ Pontos na collection: ${collectionInfo.points_count}\n`);
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testQdrantDirect()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
