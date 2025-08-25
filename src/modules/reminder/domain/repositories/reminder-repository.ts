import { Reminder, ReminderStatus } from "../entities/reminder";

export interface ReminderRepository {
  save(reminder: Reminder): Promise<Reminder>;
  findById(id: string): Promise<Reminder | null>;
  findAll(): Promise<Reminder[]>;
  findAllRemindersSince(date: Date): Promise<Reminder[]>;
  findByStatus(status: ReminderStatus): Promise<Reminder[]>;
  update(reminder: Reminder): Promise<Reminder>;
}
