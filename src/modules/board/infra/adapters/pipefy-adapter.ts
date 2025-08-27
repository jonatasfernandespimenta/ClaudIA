import { Board } from "../../domain/entities/board";
import { Card } from "../../domain/entities/card";
import { BoardAdapter, AdapterInfo, AdapterConfig } from "./board-adapter";

export class PipefyAdapter implements BoardAdapter {
  private readonly baseUrl = "https://api.pipefy.com/graphql";
  private readonly apiKey: string;
  private readonly organizationId?: string;

  constructor(config: AdapterConfig) {
    if (config.type !== 'pipefy') {
      throw new Error('Invalid adapter type for PipefyAdapter');
    }
    this.apiKey = config.apiKey;
    this.organizationId = config.organizationId;
  }

  async getBoardById(id: string): Promise<Board> {
    const query = `
      query {
        pipe(id: ${id}) {
          id
          name
          description
          phases {
            id
            name
          }
          created_at
        }
      }
    `;

    const response = await this.makeRequest(query);
    const pipe = response.data.pipe;

    if (!pipe) {
      throw new Error(`Board with ID ${id} not found`);
    }

    return new Board(
      pipe.id,
      pipe.name,
      pipe.phases.map((phase: any) => phase.name),
      pipe.description,
      pipe.created_at,
      undefined
    );
  }

  async getBoardByName(name: string): Promise<Board | null> {
    const boards = await this.getAllBoards();
    return boards.find(board => board.title === name) || null;
  }

  async getBoardPhases(boardId: string): Promise<string[]> {
    const query = `
      query {
        pipe(id: ${boardId}) {
          phases {
            id
            name
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const pipe = response.data.pipe;

    if (!pipe) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    return pipe.phases.map((phase: any) => phase.name);
  }

  async getAllBoards(): Promise<Board[]> {
    const query = `
      query {
        organization(id: ${this.organizationId}) {
          pipes {
            id
            name
            description
            phases {
              id
              name
            }
            created_at
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const pipes = response.data.organization?.pipes || [];

    return pipes.map((pipe: any) => new Board(
      pipe.id,
      pipe.name,
      pipe.phases.map((phase: any) => phase.name),
      pipe.description,
      pipe.created_at,
      undefined
    ));
  }

  async getCardsFromPhase(boardId: string, phase: string): Promise<Card[]> {
    // First get the phase ID from phase name
    const phaseId = await this.getPhaseIdByName(boardId, phase);
    
    const query = `
      query {
        phase(id: ${phaseId}) {
          cards {
            edges {
              node {
                id
                title
                assignees {
                  name
                  email
                }
                due_date
                created_at
                fields {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const cardEdges = response.data.phase?.cards?.edges || [];

    return cardEdges.map((edge: any) => {
      const card = edge.node;
      return new Card(
        card.id,
        card.title,
        phase,
        this.getFieldValue(card.fields, 'description') || undefined,
        card.assignees?.map((assignee: any) => assignee.name) || [],
        card.due_date,
        card.created_at
      );
    });
  }

  async getCardsFromAssignee(assignee: string): Promise<Card[]> {
    // First, we need to get all boards to search for cards with the assignee
    const boards = await this.getAllBoards();
    const allCards: Card[] = [];

    // Search through all boards and their phases for cards assigned to the specified user
    for (const board of boards) {
      try {
        // Get all phases for this board
        const phases = board.phases;
        
        // Search through each phase for cards
        for (const phaseName of phases) {
          try {
            const phaseCards = await this.getCardsFromPhase(board.id, phaseName);
            
            // Filter cards that have the specified assignee
            const assigneeCards = phaseCards.filter(card => 
              card.assignees?.some(cardAssignee => 
                cardAssignee.toLowerCase().includes(assignee.toLowerCase())
              )
            );
            
            allCards.push(...assigneeCards);
          } catch (phaseError) {
            // Skip phases that fail to query
            console.warn(`Failed to query phase ${phaseName} in board ${board.id}: ${phaseError}`);
          }
        }
      } catch (error) {
        // Skip boards that fail to query
        console.warn(`Failed to process board ${board.id}: ${error}`);
      }
    }

    return allCards;
  }

  async moveCard(cardId: string, newPhase: string): Promise<Card> {
    // First get the phase ID from phase name
    const card = await this.getCardById(cardId);
    const boardId = await this.getBoardIdFromCard(cardId);
    const newPhaseId = await this.getPhaseIdByName(boardId, newPhase);

    const mutation = `
      mutation {
        moveCardToPhase(input: {
          card_id: ${cardId}
          destination_phase_id: ${newPhaseId}
        }) {
          card {
            id
            title
            phase {
              name
            }
            assignees {
              name
            }
            due_date
            created_at
            fields {
              name
              value
            }
          }
        }
      }
    `;

    const response = await this.makeRequest(mutation);
    const updatedCard = response.data.moveCardToPhase.card;

    return new Card(
      updatedCard.id,
      updatedCard.title,
      updatedCard.phase.name,
      this.getFieldValue(updatedCard.fields, 'description') || undefined,
      updatedCard.assignees?.map((assignee: any) => assignee.name) || [],
      updatedCard.due_date,
      updatedCard.created_at
    );
  }

  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    const fieldsInput = [];
    
    if (updates.title) {
      fieldsInput.push(`{ field_id: "title", field_value: "${updates.title}" }`);
    }
    
    if (updates.description) {
      fieldsInput.push(`{ field_id: "description", field_value: "${updates.description}" }`);
    }

    const mutation = `
      mutation {
        updateCard(input: {
          id: ${cardId}
          ${fieldsInput.length > 0 ? `fields_attributes: [${fieldsInput.join(', ')}]` : ''}
          ${updates.expiresAt ? `due_date: "${updates.expiresAt}"` : ''}
        }) {
          card {
            id
            title
            phase {
              name
            }
            assignees {
              name
            }
            due_date
            created_at
            fields {
              name
              value
            }
          }
        }
      }
    `;

    const response = await this.makeRequest(mutation);
    const updatedCard = response.data.updateCard.card;

    return new Card(
      updatedCard.id,
      updatedCard.title,
      updatedCard.phase.name,
      this.getFieldValue(updatedCard.fields, 'description') || undefined,
      updatedCard.assignees?.map((assignee: any) => assignee.name) || [],
      updatedCard.due_date,
      updatedCard.created_at
    );
  }

  async createCard(boardId: string, phase: string, cardData: Omit<Card, 'id'>): Promise<Card> {
    const phaseId = await this.getPhaseIdByName(boardId, phase);
    
    const fieldsInput = [];
    if (cardData.description) {
      fieldsInput.push(`{ field_id: "description", field_value: "${cardData.description}" }`);
    }

    const mutation = `
      mutation {
        createCard(input: {
          pipe_id: ${boardId}
          phase_id: ${phaseId}
          title: "${cardData.title}"
          ${fieldsInput.length > 0 ? `fields_attributes: [${fieldsInput.join(', ')}]` : ''}
          ${cardData.expiresAt ? `due_date: "${cardData.expiresAt}"` : ''}
        }) {
          card {
            id
            title
            phase {
              name
            }
            assignees {
              name
            }
            due_date
            created_at
            fields {
              name
              value
            }
          }
        }
      }
    `;

    const response = await this.makeRequest(mutation);
    const newCard = response.data.createCard.card;

    return new Card(
      newCard.id,
      newCard.title,
      newCard.phase.name,
      this.getFieldValue(newCard.fields, 'description') || undefined,
      newCard.assignees?.map((assignee: any) => assignee.name) || [],
      newCard.due_date,
      newCard.created_at
    );
  }

  getAdapterInfo(): AdapterInfo {
    return {
      name: 'Pipefy Adapter',
      type: 'pipefy',
      version: '1.0.0',
      supportedFeatures: [
        'getBoardById',
        'getBoardByName',
        'getBoardPhases',
        'getAllBoards',
        'getCardsFromPhase',
        'getCardsFromAssignee',
        'moveCard',
        'updateCard',
        'createCard'
      ]
    };
  }

  private async makeRequest(query: string): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Pipefy API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.errors) {
        throw new Error(`Pipefy GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to make request to Pipefy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getPhaseIdByName(boardId: string, phaseName: string): Promise<string> {
    const query = `
      query {
        pipe(id: ${boardId}) {
          phases {
            id
            name
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const phases = response.data.pipe?.phases || [];
    const phase = phases.find((p: any) => p.name === phaseName);
    
    if (!phase) {
      throw new Error(`Phase '${phaseName}' not found in board ${boardId}`);
    }

    return phase.id;
  }

  private async getCardById(cardId: string): Promise<Card> {
    const query = `
      query {
        card(id: ${cardId}) {
          id
          title
          phase {
            name
          }
          assignees {
            name
          }
          due_date
          created_at
          fields {
            name
            value
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const card = response.data.card;

    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    return new Card(
      card.id,
      card.title,
      card.phase.name,
      this.getFieldValue(card.fields, 'description') || undefined,
      card.assignees?.map((assignee: any) => assignee.name) || [],
      card.due_date,
      card.created_at
    );
  }

  private async getBoardIdFromCard(cardId: string): Promise<string> {
    const query = `
      query {
        card(id: ${cardId}) {
          pipe {
            id
          }
        }
      }
    `;

    const response = await this.makeRequest(query);
    const card = response.data.card;

    if (!card || !card.pipe) {
      throw new Error(`Could not find board for card ${cardId}`);
    }

    return card.pipe.id;
  }

  private getFieldValue(fields: any[], fieldName: string): string | null {
    const field = fields?.find(f => f.name?.toLowerCase() === fieldName.toLowerCase());
    return field?.value || null;
  }
}
