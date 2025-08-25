import { ReminderRepository } from "../../domain/repositories/reminder-repository";

interface Output {
  reminders: string[];
  total: number;
}

export class FindAllRemindersUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(): Promise<Output> {
    const reminders = await this.reminderRepository.findAll();

    return {
      reminders: reminders.map(reminder => reminder.toString()),
      total: reminders.length
    };
  }
}
