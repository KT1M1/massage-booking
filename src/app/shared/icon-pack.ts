export interface IconEntry {
  name: string;
  className: string;
  label: string;
}

export const ICON_PACK = {
  timer: { name: 'timer', className: 'fi-rs-time-fast', label: 'Duration' },
  money: { name: 'money', className: 'fi-rs-wallet', label: 'Price' },
  professional: { name: 'professional', className: 'fi-rs-user', label: 'User' },
  calendar: { name: 'calendar', className: 'fi-rs-calendar', label: 'Calendar' },
  check: { name: 'check', className: 'fi-rs-badge-check', label: 'Confirmed' },
  trash: { name: 'trash', className: 'fi-rs-trash', label: 'Delete' },
  search: { name: 'search', className: 'fi-rs-search', label: 'Search' },
  arrowLeft: { name: 'arrowLeft', className: 'fi-rs-arrow-left', label: 'Back' }
} as const satisfies Record<string, IconEntry>;
