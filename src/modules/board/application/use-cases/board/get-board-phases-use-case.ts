import { BoardRepository } from "../../../domain/repositories/board-repository";

export interface GetBoardPhasesRequest {
  boardId: string;
}

export interface GetBoardPhasesResponse {
  success: boolean;
  phases?: string[];
  error?: string;
}

export class GetBoardPhasesUseCase {
  constructor(private boardRepository: BoardRepository) {}

  async execute(request: GetBoardPhasesRequest): Promise<GetBoardPhasesResponse> {
    try {
      if (!request.boardId?.trim()) {
        return {
          success: false,
          error: "Board ID is required"
        };
      }

      const board = this.boardRepository.getBoardById(request.boardId);
      if (!board) {
        return {
          success: false,
          error: "Board not found"
        };
      }

      const phases = this.boardRepository.getBoardPhases(request.boardId);

      return {
        success: true,
        phases
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve board phases"
      };
    }
  }
}
