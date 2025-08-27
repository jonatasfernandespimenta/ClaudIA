import { Board } from "../entities/board";

export interface BoardRepository {
  getBoardById(id: string): Board;
  getBoardByName(name: string): Board | undefined;
  getBoardPhases(id: string): string[];
}
