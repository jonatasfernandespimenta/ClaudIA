import { QdrantKnowledgeRepository } from '../infrastructure/qdrant-knowledge-repository';
import { AddKnowledgeUseCase } from './use-cases/add-knowledge';
import { SearchKnowledgeUseCase } from './use-cases/search-knowledge';
import { Knowledge, KnowledgeSearchResult } from '../domain/entities/knowledge';
import { logInfo } from '../../../utils/logger';

export class KnowledgeManager {
  private repository: QdrantKnowledgeRepository;
  private addKnowledgeUseCase: AddKnowledgeUseCase;
  private searchKnowledgeUseCase: SearchKnowledgeUseCase;

  constructor(qdrantUrl?: string) {
    this.repository = new QdrantKnowledgeRepository(qdrantUrl);
    this.addKnowledgeUseCase = new AddKnowledgeUseCase(this.repository);
    this.searchKnowledgeUseCase = new SearchKnowledgeUseCase(this.repository);
  }

  /**
   * Adiciona um novo conhecimento ao sistema
   * @param rawText - Texto original do usuário
   * @param structuredText - Texto estruturado pela ClaudIA
   * @param category - Categoria opcional do conhecimento
   * @param metadata - Metadados adicionais
   */
  async addKnowledge(
    rawText: string,
    structuredText: string,
    category?: string,
    metadata?: Record<string, any>
  ): Promise<Knowledge> {
    logInfo('KnowledgeManager', 'Adding new knowledge', {
      rawTextLength: rawText.length,
      structuredTextLength: structuredText.length,
      category,
    });

    const knowledge = await this.addKnowledgeUseCase.execute({
      content: structuredText,
      originalContent: rawText,
      category,
      metadata,
    });

    return knowledge;
  }

  /**
   * Busca conhecimentos relevantes para uma query
   * @param query - Pergunta ou texto para buscar
   * @param topK - Número de resultados a retornar (padrão: 5)
   * @param scoreThreshold - Score mínimo para aceitar resultado (padrão: 0.6)
   */
  async searchKnowledge(
    query: string,
    topK: number = 5,
    scoreThreshold: number = 0.6
  ): Promise<KnowledgeSearchResult[]> {
    logInfo('KnowledgeManager', 'Searching knowledge', { query, topK, scoreThreshold });

    const results = await this.searchKnowledgeUseCase.execute({
      query,
      topK,
      scoreThreshold,
    });

    return results;
  }

  /**
   * Formata resultados de busca como contexto para o agente
   * @param results - Resultados da busca
   * @returns String formatada com o contexto
   */
  formatAsContext(results: KnowledgeSearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map((result, index) => {
      const scorePercent = (result.score * 100).toFixed(1);
      return `[Knowledge ${index + 1}] (relevância: ${scorePercent}%)\n${result.knowledge.content}`;
    });

    return `\n\n📚 Conhecimentos relevantes da sua base:\n\n${contextParts.join('\n\n---\n\n')}`;
  }

  /**
   * Busca e retorna contexto formatado para uma query
   * @param query - Pergunta do usuário
   * @param topK - Número de resultados (padrão: 3)
   */
  async getContextForQuery(query: string, topK: number = 3): Promise<string> {
    const results = await this.searchKnowledge(query, topK, 0.6);
    return this.formatAsContext(results);
  }
}
