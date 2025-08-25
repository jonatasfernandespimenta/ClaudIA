import { createId } from '@paralleldrive/cuid2';

export interface CalendarProps {
  name: string;
  provider: 'google' | 'microsoft';
  accountId: string;
}

export class Calendar {
  constructor(
    public name: string,
    public provider: 'google' | 'microsoft',
    public accountId: string,
    public readonly id?: string,
  ) {}

  static create(props: CalendarProps) {
    return new Calendar(
      props.name,
      props.provider,
      props.accountId,
      createId(),
    );
  }
}
