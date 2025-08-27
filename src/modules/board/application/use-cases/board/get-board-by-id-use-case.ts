import { Board } from "../../../domain/entities/board";
import { BoardRepository } from "../../../domain/repositories/board-repository";

export interface GetBoardByIdRequest {
  id: string;
}

export interface GetBoardByIdResponse {
  success: boolean;
  board?: Board;
  error?: string;
}

export class GetBoardByIdUseCase {
  constructor(private boardRepository: BoardRepository) {}

  async execute(request: GetBoardByIdRequest): Promise<GetBoardByIdResponse> {
    try {
      if (!request.id?.trim()) {
        return {
          success: false,
          error: "Board ID is required"
        };
      }

      const board = this.boardRepository.getBoardById(request.id);

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
