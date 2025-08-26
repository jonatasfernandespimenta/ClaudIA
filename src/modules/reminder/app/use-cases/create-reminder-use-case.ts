import { Reminder, ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";
import { logInfo, logError } from "../../../../utils/logger";

interface Input {
  message: string;
  status?: ReminderStatus;
}

export class CreateReminderUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input) {
    logInfo('CreateReminderUseCase', 'Starting reminder creation', { 
      messageLength: props.message.length, 
      status: props.status || 'PENDING' 
    });
    
    try {
      const reminder = Reminder.create(props);
      logInfo('CreateReminderUseCase', 'Reminder entity created', { 
        id: reminder.id, 
        status: reminder.status 
      });

      await this.reminderRepository.save(reminder);
      logInfo('CreateReminderUseCase', 'Reminder saved to repository', { 
        id: reminder.id 
      });

      const result = reminder.toString();
      logInfo('CreateReminderUseCase', 'Reminder creation completed successfully', { 
        id: reminder.id,
        resultLength: result.length 
      });
      
      return result;
    } catch (error) {
      logError('CreateReminderUseCase', 'Error creating reminder', error as Error, props);
      throw error;
    }
  }
}
