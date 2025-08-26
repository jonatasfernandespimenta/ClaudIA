import { ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";
import { logInfo, logError } from "../../../../utils/logger";

interface Input {
  id: string;
  status: ReminderStatus;
}

interface Output {
  reminder: string | null;
  updated: boolean;
  previousStatus?: ReminderStatus;
  newStatus?: ReminderStatus;
}

export class UpdateReminderStatusUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    logInfo('UpdateReminderStatusUseCase', 'Starting reminder status update', { 
      id: props.id, 
      newStatus: props.status 
    });
    
    try {
      const reminder = await this.reminderRepository.findById(props.id);

      if (!reminder) {
        logInfo('UpdateReminderStatusUseCase', 'Reminder not found for status update', { id: props.id });
        return {
          reminder: null,
          updated: false
        };
      }

      const previousStatus = reminder.status;
      logInfo('UpdateReminderStatusUseCase', 'Reminder found, updating status', { 
        id: props.id, 
        previousStatus, 
        newStatus: props.status 
      });
      
      reminder.updateStatus(props.status);

      const updatedReminder = await this.reminderRepository.update(reminder);
      logInfo('UpdateReminderStatusUseCase', 'Reminder status updated successfully', { 
        id: props.id, 
        previousStatus, 
        newStatus: props.status 
      });

      return {
        reminder: updatedReminder.toString(),
        updated: true,
        previousStatus,
        newStatus: props.status
      };
    } catch (error) {
      logError('UpdateReminderStatusUseCase', 'Error updating reminder status', error as Error, props);
      throw error;
    }
  }
}
