import { Checkpoint } from "../../domain/entities/checkpoint";
import { CheckpointRepository } from "../../domain/repositories/checkpoint-repository";
import { logInfo, logError } from "../../../../utils/logger";

interface Input {
  projectName: string;
  summary: string;
}

export class CreateCheckpointUseCase {
  constructor(
    private checkpointRepository: CheckpointRepository
  ) {}

  async execute(props: Input) {
    logInfo('CreateCheckpointUseCase', 'Starting checkpoint creation', { 
      projectName: props.projectName, 
      summaryLength: props.summary.length 
    });
    
    try {
      const checkpoint = Checkpoint.create(props);
      logInfo('CreateCheckpointUseCase', 'Checkpoint entity created', { 
        id: checkpoint.id, 
        projectName: checkpoint.projectName 
      });

      await this.checkpointRepository.save(checkpoint);
      logInfo('CreateCheckpointUseCase', 'Checkpoint saved to repository', { 
        id: checkpoint.id 
      });

      const result = checkpoint.toString();
      logInfo('CreateCheckpointUseCase', 'Checkpoint creation completed successfully', { 
        id: checkpoint.id,
        resultLength: result.length 
      });
      
      return result;
    } catch (error) {
      logError('CreateCheckpointUseCase', 'Error creating checkpoint', error as Error, props);
      throw error;
    }
  }
}
