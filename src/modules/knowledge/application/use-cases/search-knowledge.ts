import { KnowledgeSearchResult } from '../../domain/entities/knowledge';
import { KnowledgeRepository } from '../../domain/repositories/knowledge-repository';

export interface SearchKnowledgeInput {
  query: string;
  topK?: number;
  scoreThreshold?: number;
}

export class SearchKnowledgeUseCase {
  constructor(private knowledgeRepository: KnowledgeRepository) {}

  async execute(input: SearchKnowledgeInput): Promise<KnowledgeSearchResult[]> {
    const results = await this.knowledgeRepository.search(
      input.query,
      input.topK || 5,
      input.scoreThreshold || 0.6
    );

    return results;
  }
}
