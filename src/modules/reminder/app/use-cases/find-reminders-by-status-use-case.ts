import { ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";

interface Input {
  status: ReminderStatus;
}

interface Output {
  reminders: string[];
  total: number;
  status: ReminderStatus;
}

export class FindRemindersByStatusUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const reminders = await this.reminderRepository.findByStatus(props.status);

    return {
      reminders: reminders.map(reminder => reminder.toString()),
      total: reminders.length,
      status: props.status
    };
  }
}
