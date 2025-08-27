import { Board } from "../../domain/entities/board";
import { BoardRepository } from "../../domain/repositories/board-repository";

export class InMemoryBoardRepository implements BoardRepository {
  private boards: Map<string, Board> = new Map();

  constructor(initialBoards: Board[] = []) {
    initialBoards.forEach(board => {
      this.boards.set(board.id, board);
    });
  }

  getBoardById(id: string): Board {
    const board = this.boards.get(id);
    if (!board) {
      throw new Error(`Board with ID ${id} not found`);
    }
    return board;
  }

  getBoardByName(name: string): Board | undefined {
    const boards = Array.from(this.boards.values());
    return boards.find(board => board.title === name);
  }

  getBoardPhases(id: string): string[] {
    const board = this.getBoardById(id);
    return board.phases;
  }

  // Additional methods for testing convenience
  save(board: Board): void {
    this.boards.set(board.id, board);
  }

  findAll(): Board[] {
    return Array.from(this.boards.values());
  }

  delete(id: string): boolean {
    return this.boards.delete(id);
  }

  clear(): void {
    this.boards.clear();
  }

  size(): number {
    return this.boards.size;
  }
}
