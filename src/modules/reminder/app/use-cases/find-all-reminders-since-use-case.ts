import { ReminderRepository } from "../../domain/repositories/reminder-repository";

interface Input {
  date: Date;
}

interface Output {
  reminders: string[];
  total: number;
  sinceDate: string;
  dateRange: {
    from: string;
    to: string;
  };
}

export class FindAllRemindersSinceUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const reminders = await this.reminderRepository.findAllRemindersSince(props.date);
    const now = new Date();

    return {
      reminders: reminders.map(reminder => reminder.toString()),
      total: reminders.length,
      sinceDate: props.date.toISOString(),
      dateRange: {
        from: props.date.toISOString(),
        to: now.toISOString()
      }
    };
  }
}
