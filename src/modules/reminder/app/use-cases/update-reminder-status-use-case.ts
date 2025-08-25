import { ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";

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
    const reminder = await this.reminderRepository.findById(props.id);

    if (!reminder) {
      return {
        reminder: null,
        updated: false
      };
    }

    const previousStatus = reminder.status;
    reminder.updateStatus(props.status);

    const updatedReminder = await this.reminderRepository.update(reminder);

    return {
      reminder: updatedReminder.toString(),
      updated: true,
      previousStatus,
      newStatus: props.status
    };
  }
}
