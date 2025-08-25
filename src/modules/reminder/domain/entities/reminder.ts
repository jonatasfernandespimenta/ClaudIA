import { createId } from '@paralleldrive/cuid2'

export enum ReminderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ReminderProps {
  message: string;
  status?: ReminderStatus;
}

export class Reminder {
  constructor(
    public message: string,
    public status: ReminderStatus,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public readonly id?: string,
  ) {}

  static create(props: ReminderProps) {
    const message = props.message.replace('-', '\n-');
    const status = props.status || ReminderStatus.PENDING;

    return new Reminder(
      message,
      status,
      new Date(),
      new Date(),
      createId()
    );
  }

  updateStatus(newStatus: ReminderStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === ReminderStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === ReminderStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === ReminderStatus.IN_PROGRESS;
  }

  isCancelled(): boolean {
    return this.status === ReminderStatus.CANCELLED;
  }

  toString() {
    return `Reminder [id=${this.id}, message=${this.message}, status=${this.status}, createdAt=${this.createdAt.toISOString()}, updatedAt=${this.updatedAt.toISOString()}]`;
  }
}
