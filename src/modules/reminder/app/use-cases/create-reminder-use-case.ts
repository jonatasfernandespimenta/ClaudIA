import { Reminder, ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";

interface Input {
  message: string;
  status?: ReminderStatus;
}

export class CreateReminderUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input) {
    const reminder = Reminder.create(props);

    await this.reminderRepository.save(reminder);

    return reminder.toString();
  }
}
