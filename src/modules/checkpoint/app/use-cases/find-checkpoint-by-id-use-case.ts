import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";
import { logInfo, logError } from "../../../../utils/logger";

interface Input {
  id: string;
}

interface Output {
  checkpoint: string | null;
  found: boolean;
}

export class FindCheckpointByIdUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    logInfo('FindCheckpointByIdUseCase', 'Starting to find checkpoint by ID', { id: props.id });
    
    try {
      const checkpoint = await this.checkpointRepository.findById(props.id);

      if (!checkpoint) {
        logInfo('FindCheckpointByIdUseCase', 'Checkpoint not found', { id: props.id });
        return {
          checkpoint: null,
          found: false
        };
      }

      logInfo('FindCheckpointByIdUseCase', 'Checkpoint found successfully', { 
        id: props.id, 
        projectName: checkpoint.projectName 
      });
      
      return {
        checkpoint: checkpoint.toString(),
        found: true
      };
    } catch (error) {
      logError('FindCheckpointByIdUseCase', 'Error finding checkpoint by ID', error as Error, { id: props.id });
      throw error;
    }
  }
}
