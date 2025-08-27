import { Board } from "../../domain/entities/board";
import { BoardRepository } from "../../domain/repositories/board-repository";
import { BoardAdapter } from "../adapters/board-adapter";

export class ExternalBoardRepository implements BoardRepository {
  constructor(private readonly adapter: BoardAdapter) {}

  getBoardById(id: string): Board {
    // Convert async to sync - in a real implementation you might want to handle this differently
    // This is just to match the existing interface
    throw new Error("Use async version: getBoardByIdAsync");
  }

  getBoardByName(name: string): Board | undefined {
    // Convert async to sync - in a real implementation you might want to handle this differently  
    throw new Error("Use async version: getBoardByNameAsync");
  }

  getBoardPhases(id: string): string[] {
    // Convert async to sync - in a real implementation you might want to handle this differently
    throw new Error("Use async version: getBoardPhasesAsync");
  }

  // Async versions that actually work with the adapters
  async getBoardByIdAsync(id: string): Promise<Board> {
    return await this.adapter.getBoardById(id);
  }

  async getBoardByNameAsync(name: string): Promise<Board | null> {
    return await this.adapter.getBoardByName(name);
  }

  async getBoardPhasesAsync(id: string): Promise<string[]> {
    return await this.adapter.getBoardPhases(id);
  }

  async getAllBoardsAsync(): Promise<Board[]> {
    return await this.adapter.getAllBoards();
  }

  // Additional methods that leverage the adapter's capabilities
  async createCardAsync(boardId: string, phase: string, cardData: any): Promise<any> {
    return await this.adapter.createCard(boardId, phase, cardData);
  }

  async moveCardAsync(cardId: string, newPhase: string): Promise<any> {
    return await this.adapter.moveCard(cardId, newPhase);
  }

  async updateCardAsync(cardId: string, updates: any): Promise<any> {
    return await this.adapter.updateCard(cardId, updates);
  }

  getAdapterInfo() {
    return this.adapter.getAdapterInfo();
  }
}
