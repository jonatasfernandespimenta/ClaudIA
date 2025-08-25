import { Checkpoint } from "../entities/checkpoint";

export interface CheckpointRepository {
  save(checkpoint: Checkpoint): Promise<Checkpoint>;
  findById(id: string): Promise<Checkpoint | null>;
  findAll(): Promise<Checkpoint[]>;
  findByProjectName(projectName: string): Promise<Checkpoint[]>;
  findAllCheckpointsSince(date: Date): Promise<Checkpoint[]>;
}
