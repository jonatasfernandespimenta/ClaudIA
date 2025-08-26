import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";
import { logInfo, logError } from "../../../../utils/logger";

interface Output {
  checkpoints: string[];
  total: number;
}

export class FindAllCheckpointsUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(): Promise<Output> {
    logInfo('FindAllCheckpointsUseCase', 'Starting to find all checkpoints');
    
    try {
      const checkpoints = await this.checkpointRepository.findAll();
      logInfo('FindAllCheckpointsUseCase', 'Checkpoints retrieved from repository', { 
        count: checkpoints.length 
      });

      const result = {
        checkpoints: checkpoints.map(checkpoint => checkpoint.toString()),
        total: checkpoints.length
      };
      
      logInfo('FindAllCheckpointsUseCase', 'All checkpoints found successfully', { 
        total: result.total 
      });
      
      return result;
    } catch (error) {
      logError('FindAllCheckpointsUseCase', 'Error finding all checkpoints', error as Error);
      throw error;
    }
  }
}
