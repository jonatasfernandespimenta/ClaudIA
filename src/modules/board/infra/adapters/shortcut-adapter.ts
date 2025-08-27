import { Board } from "../../domain/entities/board";
import { Card } from "../../domain/entities/card";
import { BoardAdapter, AdapterInfo, AdapterConfig } from "./board-adapter";

interface ShortcutWorkflow {
  id: number;
  name: string;
  description?: string;
  states: ShortcutState[];
  created_at: string;
  updated_at: string;
}

interface ShortcutState {
  id: number;
  name: string;
  type: 'unstarted' | 'started' | 'done';
}

interface ShortcutStory {
  id: number;
  name: string;
  description?: string;
  workflow_state_id: number;
  owner_ids: number[];
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export class ShortcutAdapter implements BoardAdapter {
  private readonly baseUrl = "https://api.app.shortcut.com/api/v3";
  private readonly apiKey: string;
  private readonly workspaceId?: string;

  constructor(config: AdapterConfig) {
    if (config.type !== 'shortcut') {
      throw new Error('Invalid adapter type for ShortcutAdapter');
    }
    this.apiKey = config.apiKey;
    this.workspaceId = config.workspaceId;
  }

  async getBoardById(id: string): Promise<Board> {
    const workflow = await this.getWorkflowById(id);
    
    return new Board(
      workflow.id.toString(),
      workflow.name,
      workflow.states.map(state => state.name),
      workflow.description,
      workflow.created_at,
      workflow.updated_at
    );
  }

  async getBoardByName(name: string): Promise<Board | null> {
    const workflows = await this.getAllWorkflows();
    const workflow = workflows.find(w => w.name === name);
    
    if (!workflow) {
      return null;
    }

    return new Board(
      workflow.id.toString(),
      workflow.name,
      workflow.states.map(state => state.name),
      workflow.description,
      workflow.created_at,
      workflow.updated_at
    );
  }

  async getBoardPhases(boardId: string): Promise<string[]> {
    const workflow = await this.getWorkflowById(boardId);
    return workflow.states.map(state => state.name);
  }

  async getAllBoards(): Promise<Board[]> {
    const workflows = await this.getAllWorkflows();
    
    return workflows.map(workflow => new Board(
      workflow.id.toString(),
      workflow.name,
      workflow.states.map(state => state.name),
      workflow.description,
      workflow.created_at,
      workflow.updated_at
    ));
  }

  async getCardsFromPhase(boardId: string, phase: string): Promise<Card[]> {
    const workflow = await this.getWorkflowById(boardId);
    const state = workflow.states.find(s => s.name === phase);
    
    if (!state) {
      throw new Error(`Phase '${phase}' not found in workflow ${boardId}`);
    }

    const stories = await this.makeRequest<ShortcutStory[]>(`/stories?workflow_state_id=${state.id}`);
    
    return stories.map(story => this.mapStoryToCard(story, phase));
  }

  async getCardsFromAssignee(assignee: string): Promise<Card[]> {
    // In Shortcut, we need to search by owner_id
    // This assumes assignee is a user ID - in a real implementation, 
    // you might need to resolve username to ID first
    const stories = await this.makeRequest<ShortcutStory[]>(`/stories?owner_id=${assignee}`);
    
    const cardsPromises = stories.map(async (story) => {
      const stateName = await this.getStateNameById(story.workflow_state_id);
      return this.mapStoryToCard(story, stateName);
    });

    return Promise.all(cardsPromises);
  }

  async moveCard(cardId: string, newPhase: string): Promise<Card> {
    // First, get the current story to find its workflow
    const story = await this.makeRequest<ShortcutStory>(`/stories/${cardId}`);
    
    // Find the workflow and state ID for the new phase
    const workflows = await this.getAllWorkflows();
    let newStateId: number | undefined;
    
    for (const workflow of workflows) {
      const state = workflow.states.find(s => s.name === newPhase);
      if (state) {
        newStateId = state.id;
        break;
      }
    }

    if (!newStateId) {
      throw new Error(`Phase '${newPhase}' not found in any workflow`);
    }

    const updatedStory = await this.makeRequest<ShortcutStory>(`/stories/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({
        workflow_state_id: newStateId
      })
    });

    return this.mapStoryToCard(updatedStory, newPhase);
  }

  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    const updateData: any = {};
    
    if (updates.title) {
      updateData.name = updates.title;
    }
    
    if (updates.description) {
      updateData.description = updates.description;
    }

    if (updates.expiresAt) {
      updateData.deadline = updates.expiresAt;
    }

    const updatedStory = await this.makeRequest<ShortcutStory>(`/stories/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    const stateName = await this.getStateNameById(updatedStory.workflow_state_id);
    return this.mapStoryToCard(updatedStory, stateName);
  }

  async createCard(boardId: string, phase: string, cardData: Omit<Card, 'id'>): Promise<Card> {
    const workflow = await this.getWorkflowById(boardId);
    const state = workflow.states.find(s => s.name === phase);
    
    if (!state) {
      throw new Error(`Phase '${phase}' not found in workflow ${boardId}`);
    }

    const storyData = {
      name: cardData.title,
      description: cardData.description || '',
      workflow_state_id: state.id,
      deadline: cardData.expiresAt || undefined
    };

    const newStory = await this.makeRequest<ShortcutStory>('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData)
    });

    return this.mapStoryToCard(newStory, phase);
  }

  getAdapterInfo(): AdapterInfo {
    return {
      name: 'Shortcut Adapter',
      type: 'shortcut',
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

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Shortcut-Token': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Shortcut API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      throw new Error(`Failed to make request to Shortcut: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getAllWorkflows(): Promise<ShortcutWorkflow[]> {
    return this.makeRequest<ShortcutWorkflow[]>('/workflows');
  }

  private async getWorkflowById(id: string): Promise<ShortcutWorkflow> {
    const workflows = await this.getAllWorkflows();
    const workflow = workflows.find(w => w.id.toString() === id);
    
    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  private async getStateNameById(stateId: number): Promise<string> {
    const workflows = await this.getAllWorkflows();
    
    for (const workflow of workflows) {
      const state = workflow.states.find(s => s.id === stateId);
      if (state) {
        return state.name;
      }
    }

    throw new Error(`State with ID ${stateId} not found`);
  }

  private async getUsernamesFromIds(userIds: number[]): Promise<string[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    try {
      // Get member information - this might require additional API calls
      // For now, we'll return the IDs as strings
      return userIds.map(id => id.toString());
    } catch (error) {
      // If we can't resolve usernames, return IDs as fallback
      return userIds.map(id => id.toString());
    }
  }

  private mapStoryToCard(story: ShortcutStory, stateName: string): Card {
    return new Card(
      story.id.toString(),
      story.name,
      stateName,
      story.description,
      story.owner_ids?.map(id => id.toString()) || [],
      story.deadline,
      story.created_at
    );
  }
}
