import { Knowledge, KnowledgeSearchResult } from '../entities/knowledge';

export interface KnowledgeRepository {
  add(knowledge: Omit<Knowledge, 'id'>): Promise<Knowledge>;
  search(query: string, topK?: number, scoreThreshold?: number): Promise<KnowledgeSearchResult[]>;
  findById(id: string): Promise<Knowledge | null>;
  delete(id: string): Promise<void>;
}
