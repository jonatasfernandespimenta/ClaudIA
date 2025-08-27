import { Reminder, ReminderStatus } from "../../domain/entities/reminder";
import { ReminderRepository } from "../../domain/repositories/reminder-repository";

export class InMemoryReminderRepository implements ReminderRepository {
  private reminders: Map<string, Reminder> = new Map();

  constructor(initialReminders: Reminder[] = []) {
    initialReminders.forEach(reminder => {
      if (reminder.id) {
        this.reminders.set(reminder.id, reminder);
      }
    });
  }

  async save(reminder: Reminder): Promise<Reminder> {
    if (!reminder.id) {
      throw new Error("Reminder must have an ID to be saved");
    }
    this.reminders.set(reminder.id, reminder);
    return Promise.resolve(reminder);
  }

  async findById(id: string): Promise<Reminder | null> {
    const reminder = this.reminders.get(id);
    return Promise.resolve(reminder || null);
  }

  async findAll(): Promise<Reminder[]> {
    const reminders = Array.from(this.reminders.values());
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async findAllRemindersSince(date: Date): Promise<Reminder[]> {
    const reminders = Array.from(this.reminders.values())
      .filter(reminder => reminder.createdAt >= date);
    
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async findByStatus(status: ReminderStatus): Promise<Reminder[]> {
    const reminders = Array.from(this.reminders.values())
      .filter(reminder => reminder.status === status);
    
    // Sort by createdAt descending (most recent first)
    return Promise.resolve(
      reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async update(reminder: Reminder): Promise<Reminder> {
    if (!reminder.id) {
      throw new Error("Reminder must have an ID to be updated");
    }
    
    if (!this.reminders.has(reminder.id)) {
      throw new Error(`Reminder with ID ${reminder.id} not found`);
    }
    
    this.reminders.set(reminder.id, reminder);
    return Promise.resolve(reminder);
  }

  // Additional methods for testing convenience
  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.reminders.delete(id));
  }

  clear(): void {
    this.reminders.clear();
  }

  size(): number {
    return this.reminders.size;
  }

  async findByMultipleStatuses(statuses: ReminderStatus[]): Promise<Reminder[]> {
    const reminders = Array.from(this.reminders.values())
      .filter(reminder => statuses.includes(reminder.status));
    
    return Promise.resolve(
      reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  async findActiveReminders(): Promise<Reminder[]> {
    return this.findByMultipleStatuses([
      ReminderStatus.PENDING, 
      ReminderStatus.IN_PROGRESS
    ]);
  }

  async countByStatus(): Promise<Record<ReminderStatus, number>> {
    const reminders = Array.from(this.reminders.values());
    
    return Promise.resolve({
      [ReminderStatus.PENDING]: reminders.filter(r => r.isPending()).length,
      [ReminderStatus.IN_PROGRESS]: reminders.filter(r => r.isInProgress()).length,
      [ReminderStatus.COMPLETED]: reminders.filter(r => r.isCompleted()).length,
      [ReminderStatus.CANCELLED]: reminders.filter(r => r.isCancelled()).length,
    });
  }

  async findRemindersSince(date: Date, status?: ReminderStatus): Promise<Reminder[]> {
    let reminders = Array.from(this.reminders.values())
      .filter(reminder => reminder.createdAt >= date);
    
    if (status) {
      reminders = reminders.filter(reminder => reminder.status === status);
    }
    
    return Promise.resolve(
      reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }
}
