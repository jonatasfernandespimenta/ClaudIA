import { ReminderRepository } from "../../domain/repositories/reminder-repository";

interface Input {
  id: string;
}

interface Output {
  reminder: string | null;
  found: boolean;
}

export class FindReminderByIdUseCase {
  constructor(
    private reminderRepository: ReminderRepository
  ) {}

  async execute(props: Input): Promise<Output> {
    const reminder = await this.reminderRepository.findById(props.id);

    if (!reminder) {
      return {
        reminder: null,
        found: false
      };
    }

    return {
      reminder: reminder.toString(),
      found: true
    };
  }
}
