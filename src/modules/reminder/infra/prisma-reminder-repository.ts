import { PrismaClient } from "@prisma/client";
import { Reminder, ReminderStatus } from "../domain/entities/reminder";
import { ReminderRepository } from "../domain/repositories/reminder-repository";
import { logInfo, logError } from "../../../utils/logger";

export class PrismaReminderRepository implements ReminderRepository {
  constructor(private prisma: PrismaClient) {}

  async save(reminder: Reminder): Promise<Reminder> {
    logInfo('PrismaReminderRepository', 'Starting to save reminder', { 
      id: reminder.id, 
      status: reminder.status,
      messageLength: reminder.message.length
    });
    
    try {
      const savedReminder = await this.prisma.reminder.create({
        data: {
          id: reminder.id!,
          message: reminder.message,
          status: reminder.status,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt,
        },
      });
      
      logInfo('PrismaReminderRepository', 'Reminder saved successfully', { 
        id: savedReminder.id,
        status: savedReminder.status
      });

      return new Reminder(
        savedReminder.message,
        savedReminder.status as ReminderStatus,
        savedReminder.createdAt,
        savedReminder.updatedAt,
        savedReminder.id
      );
    } catch (error) {
      logError('PrismaReminderRepository', 'Error saving reminder', error as Error, { 
        id: reminder.id, 
        status: reminder.status
      });
      throw error;
    }
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
    logInfo('PrismaReminderRepository', 'Finding all reminders');
    
    try {
      const reminders = await this.prisma.reminder.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      logInfo('PrismaReminderRepository', 'All reminders retrieved successfully', { 
        count: reminders.length 
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
    } catch (error) {
      logError('PrismaReminderRepository', 'Error finding all reminders', error as Error);
      throw error;
    }
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
    logInfo('PrismaReminderRepository', 'Starting to update reminder', { 
      id: reminder.id, 
      status: reminder.status
    });
    
    try {
      const updatedReminder = await this.prisma.reminder.update({
        where: { id: reminder.id! },
        data: {
          message: reminder.message,
          status: reminder.status,
          updatedAt: reminder.updatedAt,
        },
      });
      
      logInfo('PrismaReminderRepository', 'Reminder updated successfully', { 
        id: updatedReminder.id,
        status: updatedReminder.status
      });

      return new Reminder(
        updatedReminder.message,
        updatedReminder.status as ReminderStatus,
        updatedReminder.createdAt,
        updatedReminder.updatedAt,
        updatedReminder.id
      );
    } catch (error) {
      logError('PrismaReminderRepository', 'Error updating reminder', error as Error, { 
        id: reminder.id 
      });
      throw error;
    }
  }
}
