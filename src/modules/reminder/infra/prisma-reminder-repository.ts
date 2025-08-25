import { PrismaClient } from "@prisma/client";
import { Reminder, ReminderStatus } from "../domain/entities/reminder";
import { ReminderRepository } from "../domain/repositories/reminder-repository";

export class PrismaReminderRepository implements ReminderRepository {
  constructor(private prisma: PrismaClient) {}

  async save(reminder: Reminder): Promise<Reminder> {
    const savedReminder = await this.prisma.reminder.create({
      data: {
        id: reminder.id!,
        message: reminder.message,
        status: reminder.status,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      },
    });

    return new Reminder(
      savedReminder.message,
      savedReminder.status as ReminderStatus,
      savedReminder.createdAt,
      savedReminder.updatedAt,
      savedReminder.id
    );
  }

  async findById(id: string): Promise<Reminder | null> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return null;
    }

    return new Reminder(
      reminder.message,
      reminder.status as ReminderStatus,
      reminder.createdAt,
      reminder.updatedAt,
      reminder.id
    );
  }

  async findAll(): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return reminders.map(
      (reminder) =>
        new Reminder(
          reminder.message,
          reminder.status as ReminderStatus,
          reminder.createdAt,
          reminder.updatedAt,
          reminder.id
        )
    );
  }

  async findAllRemindersSince(date: Date): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: {
        createdAt: {
          gte: date,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reminders.map(
      (reminder) =>
        new Reminder(
          reminder.message,
          reminder.status as ReminderStatus,
          reminder.createdAt,
          reminder.updatedAt,
          reminder.id
        )
    );
  }

  async findByStatus(status: ReminderStatus): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return reminders.map(
      (reminder) =>
        new Reminder(
          reminder.message,
          reminder.status as ReminderStatus,
          reminder.createdAt,
          reminder.updatedAt,
          reminder.id
        )
    );
  }

  async update(reminder: Reminder): Promise<Reminder> {
    const updatedReminder = await this.prisma.reminder.update({
      where: { id: reminder.id! },
      data: {
        message: reminder.message,
        status: reminder.status,
        updatedAt: reminder.updatedAt,
      },
    });

    return new Reminder(
      updatedReminder.message,
      updatedReminder.status as ReminderStatus,
      updatedReminder.createdAt,
      updatedReminder.updatedAt,
      updatedReminder.id
    );
  }
}
