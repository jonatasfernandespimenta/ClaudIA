import { Checkpoint } from "../../domain/entities/checkpoint";
import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";

export class InMemoryCheckpointRepository implements CheckpointRepository {
  private checkpoints: Map<string, Checkpoint> = new Map();

  constructor(initialCheckpoints: Checkpoint[] = []) {
    initialCheckpoints.forEach(checkpoint => {
      if (checkpoint.id) {
        this.checkpoints.set(checkpoint.id, checkpoint);
      }
    });
  }

  async save(checkpoint: Checkpoint): Promise<Checkpoint> {
    if (!checkpoint.id) {
      throw new Error("Checkpoint must have an ID to be saved");
    }
    this.checkpoints.set(checkpoint.id, checkpoint);
    return Promise.resolve(checkpoint);
  }

  async findById(id: string): Promise<Checkpoint | null> {
    const checkpoint = this.checkpoints.get(id);
    return Promise.resolve(checkpoint || null);
  }

  async findAll(): Promise<Checkpoint[]> {
    const checkpoints = Array.from(this.checkpoints.values());
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      checkpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async findByProjectName(projectName: string): Promise<Checkpoint[]> {
    const checkpoints = Array.from(this.checkpoints.values())
      .filter(checkpoint => checkpoint.projectName === projectName);
    
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      checkpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async findAllCheckpointsSince(date: Date): Promise<Checkpoint[]> {
    const checkpoints = Array.from(this.checkpoints.values())
      .filter(checkpoint => checkpoint.createdAt >= date);
    
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      checkpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  // Additional methods for testing convenience
  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.checkpoints.delete(id));
  }

  clear(): void {
    this.checkpoints.clear();
  }

  size(): number {
    return this.checkpoints.size;
  }

  async findByProjectNameSince(projectName: string, date: Date): Promise<Checkpoint[]> {
    const checkpoints = Array.from(this.checkpoints.values())
      .filter(checkpoint => 
        checkpoint.projectName === projectName && 
        checkpoint.createdAt >= date
      );
    
    return Promise.resolve(
      checkpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async getProjectNames(): Promise<string[]> {
    const projectNames = Array.from(this.checkpoints.values())
      .map(checkpoint => checkpoint.projectName);
    
    return Promise.resolve([...new Set(projectNames)].sort());
  }
}
