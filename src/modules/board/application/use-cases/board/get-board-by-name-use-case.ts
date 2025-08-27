import { Board } from "../../../domain/entities/board";
import { BoardRepository } from "../../../domain/repositories/board-repository";

export interface GetBoardByNameRequest {
  name: string;
}

export interface GetBoardByNameResponse {
  success: boolean;
  board?: Board;
  error?: string;
}

export class GetBoardByNameUseCase {
  constructor(private boardRepository: BoardRepository) {}

  async execute(request: GetBoardByNameRequest): Promise<GetBoardByNameResponse> {
    try {
      if (!request.name?.trim()) {
        return {
          success: false,
          error: "Board name is required"
        };
      }

      const board = this.boardRepository.getBoardByName(request.name);

      if (!board) {
        return {
          success: false,
          error: "Board not found"
        };
      }

      return {
        success: true,
        board
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve board"
      };
    }
  }
}
