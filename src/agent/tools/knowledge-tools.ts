import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { addKnowledgeSchema, searchKnowledgeSchema } from './knowledge-schemas';
import { KnowledgeManager } from '../../modules/knowledge/application/knowledge-manager';
import { logInfo, logError } from '../../utils/logger';
import { ChatOpenAI } from '@langchain/openai';

// Singleton do KnowledgeManager
let knowledgeManager: KnowledgeManager | null = null;

function getKnowledgeManager(): KnowledgeManager {
  if (!knowledgeManager) {
    knowledgeManager = new KnowledgeManager();
  }
  return knowledgeManager;
}

// Modelo para estruturar conhecimento
const structureModel = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Usa a ClaudIA para estruturar o texto sem adicionar ou remover ideias
 */
async function structureKnowledge(rawText: string): Promise<string> {
  const prompt = `Estruture este texto de forma clara e organizada, SEM adicionar novas informações ou remover ideias existentes. 
Apenas organize o texto mantendo 100% do conteúdo original:

${rawText}

Texto estruturado:`;

  const response = await structureModel.invoke(prompt);
  return response.content as string;
}

export const addKnowledgeTool = tool(
  async (input) => {
    const { text, category } = input as z.infer<typeof addKnowledgeSchema>;
    
    logInfo('KnowledgeTool', 'Adding new knowledge', {
      textLength: text.length,
      category,
    });

    try {
      const km = getKnowledgeManager();

      // Estruturar o texto com ClaudIA
      logInfo('KnowledgeTool', 'Structuring knowledge text');
      const structuredText = await structureKnowledge(text);

      // Adicionar ao knowledge base
      const knowledge = await km.addKnowledge(
        text,
        structuredText,
        category,
        { source: 'user_input' }
      );

      logInfo('KnowledgeTool', 'Knowledge added successfully', {
        id: knowledge.id,
        category: knowledge.category,
      });

      return `✅ Conhecimento adicionado com sucesso!

📝 **Texto original:** ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}

📚 **Texto estruturado:** ${structuredText.substring(0, 200)}${structuredText.length > 200 ? '...' : ''}

🏷️ **Categoria:** ${category || 'Sem categoria'}

🆔 **ID:** ${knowledge.id}

Este conhecimento agora está disponível para consultas futuras!`;
    } catch (error) {
      logError('KnowledgeTool', 'Error adding knowledge', error as Error);
      throw error;
    }
  },
  {
    name: 'add_knowledge',
    description: 'Add new knowledge to the ClaudIA knowledge base. The knowledge will be structured and stored for future reference. Use this when the user wants to teach ClaudIA something new or store important information.',
    schema: addKnowledgeSchema,
  }
);

export const searchKnowledgeTool = tool(
  async (input) => {
    const { query, topK } = input as z.infer<typeof searchKnowledgeSchema>;

    logInfo('KnowledgeTool', 'Searching knowledge', { query, topK });

    try {
      const km = getKnowledgeManager();
      const results = await km.searchKnowledge(query, topK, 0.6);

      if (results.length === 0) {
        return `❌ Nenhum conhecimento relevante encontrado para: "${query}"

💡 Dica: Tente reformular a pergunta ou adicionar novos conhecimentos usando a ferramenta add_knowledge.`;
      }

      logInfo('KnowledgeTool', 'Knowledge search completed', {
        resultsCount: results.length,
      });

      const formattedResults = results
        .map((result, index) => {
          const scorePercent = (result.score * 100).toFixed(1);
          const timestamp = result.knowledge.timestamp.toLocaleDateString('pt-BR');
          return `📚 **Conhecimento ${index + 1}** (Relevância: ${scorePercent}%)
${result.knowledge.content}

🏷️ Categoria: ${result.knowledge.category || 'Sem categoria'}
📅 Adicionado em: ${timestamp}
${'─'.repeat(50)}`;
        })
        .join('\n\n');

      return `🔍 Encontrei ${results.length} conhecimento(s) relevante(s) para: "${query}"

${formattedResults}`;
    } catch (error) {
      logError('KnowledgeTool', 'Error searching knowledge', error as Error);
      throw error;
    }
  },
  {
    name: 'search_knowledge',
    description: 'Search the ClaudIA knowledge base for relevant information. Returns stored knowledge that matches the query. Use this to recall previously learned information or answer questions based on stored knowledge.',
    schema: searchKnowledgeSchema,
  }
);

// Exportar array de tools
export const knowledgeTools = [
  addKnowledgeTool,
  searchKnowledgeTool,
];

// Exportar função para obter contexto (usada pelo AgentManager)
export async function getKnowledgeContext(query: string): Promise<string> {
  const km = getKnowledgeManager();
  return km.getContextForQuery(query, 3);
}
