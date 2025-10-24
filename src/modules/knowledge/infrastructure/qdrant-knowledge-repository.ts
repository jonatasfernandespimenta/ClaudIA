import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { randomUUID } from 'crypto';
import { Knowledge, KnowledgeSearchResult } from '../domain/entities/knowledge';
import { KnowledgeRepository } from '../domain/repositories/knowledge-repository';
import { logInfo, logError } from '../../../utils/logger';

export class QdrantKnowledgeRepository implements KnowledgeRepository {
  private client: QdrantClient;
  private embeddings: OpenAIEmbeddings;
  private collectionName = 'claudia_knowledge';
  private vectorSize = 1536; // text-embedding-3-small dimension
  private initPromise: Promise<void>;

  constructor(qdrantUrl: string = 'http://localhost:6333') {
    this.client = new QdrantClient({ url: qdrantUrl });
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    this.initPromise = this.initCollection();
  }

  private async initCollection(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (!exists) {
        logInfo('QdrantRepository', 'Creating knowledge collection');
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        logInfo('QdrantRepository', 'Knowledge collection created successfully');
      }
    } catch (error) {
      logError('QdrantRepository', 'Error initializing collection', error as Error);
      throw error;
    }
  }

  async add(knowledge: Omit<Knowledge, 'id'>): Promise<Knowledge> {
    try {
      // Garantir que a collection foi inicializada
      await this.initPromise;
      
      // Usar UUID ao invés de CUID (Qdrant só aceita UUID ou números)
      const id = randomUUID();
      
      logInfo('QdrantRepository', 'Generating embedding for knowledge', {
        contentLength: knowledge.content.length,
      });

      // Gerar embedding do conteúdo
      const vector = await this.embeddings.embedQuery(knowledge.content);

      logInfo('QdrantRepository', 'Preparing to upsert to Qdrant', {
        id,
        vectorLength: vector.length,
        hasCategory: !!knowledge.category,
        hasMetadata: !!knowledge.metadata,
      });

      // Adicionar ao Qdrant
      await this.client.upsert(this.collectionName, {
        points: [
          {
            id,
            vector,
            payload: {
              content: knowledge.content,
              originalContent: knowledge.originalContent,
              category: knowledge.category,
              timestamp: knowledge.timestamp.toISOString(),
              metadata: knowledge.metadata || {},
            },
          },
        ],
      });

      logInfo('QdrantRepository', 'Knowledge added successfully', { id });

      return { id, ...knowledge };
    } catch (error) {
      logError('QdrantRepository', 'Error adding knowledge', error as Error);
      throw error;
    }
  }

  async search(
    query: string,
    topK: number = 5,
    scoreThreshold: number = 0.6
  ): Promise<KnowledgeSearchResult[]> {
    try {
      // Garantir que a collection foi inicializada
      await this.initPromise;
      
      logInfo('QdrantRepository', 'Searching knowledge', { query, topK });

      // Gerar embedding da query
      const queryVector = await this.embeddings.embedQuery(query);

      // Buscar no Qdrant
      const results = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit: topK,
        score_threshold: scoreThreshold,
        with_payload: true,
      });

      logInfo('QdrantRepository', 'Search completed', {
        resultsCount: results.length,
      });

      // Se não houver resultados, retornar array vazio
      if (results.length === 0) {
        return [];
      }

      return results.map((hit) => ({
        knowledge: {
          id: hit.id as string,
          content: hit.payload?.content as string,
          originalContent: hit.payload?.originalContent as string,
          category: hit.payload?.category as string | undefined,
          timestamp: new Date(hit.payload?.timestamp as string),
          metadata: (hit.payload?.metadata as Record<string, any>) || {},
        },
        score: hit.score,
      }));
    } catch (error) {
      logError('QdrantRepository', 'Error searching knowledge', error as Error);
      // Em caso de erro, retornar array vazio ao invés de throw
      return [];
    }
  }

  async findById(id: string): Promise<Knowledge | null> {
    try {
      const result = await this.client.retrieve(this.collectionName, {
        ids: [id],
        with_payload: true,
      });

      if (result.length === 0) {
        return null;
      }

      const point = result[0];
      return {
        id: point.id as string,
        content: point.payload?.content as string,
        originalContent: point.payload?.originalContent as string,
        category: point.payload?.category as string | undefined,
        timestamp: new Date(point.payload?.timestamp as string),
        metadata: (point.payload?.metadata as Record<string, any>) || {},
      };
    } catch (error) {
      logError('QdrantRepository', 'Error finding knowledge by ID', error as Error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        points: [id],
      });
      logInfo('QdrantRepository', 'Knowledge deleted', { id });
    } catch (error) {
      logError('QdrantRepository', 'Error deleting knowledge', error as Error);
      throw error;
    }
  }
}
