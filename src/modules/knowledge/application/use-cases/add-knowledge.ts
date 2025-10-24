import { Knowledge } from '../../domain/entities/knowledge';
import { KnowledgeRepository } from '../../domain/repositories/knowledge-repository';

export interface AddKnowledgeInput {
  content: string;
  originalContent: string;
  category?: string;
  metadata?: Record<string, any>;
}

export class AddKnowledgeUseCase {
  constructor(private knowledgeRepository: KnowledgeRepository) {}

  async execute(input: AddKnowledgeInput): Promise<Knowledge> {
    const knowledge = await this.knowledgeRepository.add({
      content: input.content,
      originalContent: input.originalContent,
      category: input.category,
      timestamp: new Date(),
      metadata: input.metadata,
    });

    return knowledge;
  }
}
