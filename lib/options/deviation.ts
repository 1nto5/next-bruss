import { correctiveActionType } from '../types/deviation';

export const correctiveActionStatusOptions: {
  value: correctiveActionType['status'];
  label: string;
}[] = [
  { value: 'open', label: 'Otwarta' },
  { value: 'closed', label: 'Zakończona' },
  { value: 'overdue', label: 'Zaległa' },
  { value: 'in progress', label: 'W trakcie' },
  { value: 'rejected', label: 'Odrzucona' },
];
