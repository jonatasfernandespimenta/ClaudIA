export interface Knowledge {
  id: string;
  content: string;
  originalContent: string;
  category?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface KnowledgeSearchResult {
  knowledge: Knowledge;
  score: number;
}
