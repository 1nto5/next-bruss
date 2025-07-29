import { EmployeeType } from '@/lib/types/employee-types';

// Add or update the status options to include 'forecast'
export type OvertimeStatus =
  | 'forecast'
  | 'pending'
  | 'approved'
  | 'canceled'
  | 'completed'
  | 'accounted';

export type ArticleQuantityType = {
  articleNumber: string;
  quantity: number;
};

export type OvertimeType = {
  _id: string;
  internalId?: string; // Format: "N/YY", e.g. "1/25" - Optional as existing orders don't have it
  status: OvertimeStatus;
  numberOfEmployees: number; // Number of employees in the order
  numberOfShifts: number; // Number of shifts
  responsibleEmployee: string; // Email of the responsible person
  employeesWithScheduledDayOff: overtimeRequestEmployeeType[]; // Employees who want to take time off
  from: Date;
  to: Date;
  reason: string;
  note: string;
  requestedAt: Date;
  requestedBy: string;
  editedAt: Date;
  editedBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  canceledAt?: Date;
  canceledBy?: string;
  completedAt?: Date;
  completedBy?: string;
  accountedAt?: Date;
  accountedBy?: string;
  hasAttachment?: boolean;
  attachmentFilename?: string;
  // New fields for forecasting with multiple articles
  plannedArticles?: ArticleQuantityType[];
  actualArticles?: ArticleQuantityType[];
  actualEmployeesWorked?: number;
};

export type overtimeRequestEmployeeType = EmployeeType & {
  agreedReceivingAt?: Date; // Date of receiving a day off
  agreedReceivingAtLocaleString?: string;
  note?: string;
};

// Forecast types
export type ForecastFilterType = 'week' | 'month' | 'year';

export type ForecastRequestDetail = {
  _id: string;
  internalId?: string;
  status: OvertimeStatus;
  from: Date;
  to: Date;
  numberOfEmployees: number;
  actualEmployeesWorked?: number;
  responsibleEmployee: string;
  reason: string;
};

export type ForecastPeriodData = {
  period: string;
  forecastCount: number;
  historicalCount: number;
  forecastHours: number;
  historicalHours: number;
  totalHours: number;
  totalCount: number;
  details: {
    forecast: ForecastRequestDetail[];
    historical: ForecastRequestDetail[];
  };
};

export type ForecastSummary = {
  totalForecastHours: number;
  totalHistoricalHours: number;
  totalForecastCount: number;
  totalHistoricalCount: number;
  filterType: ForecastFilterType;
  year: number;
  startValue: number;
  endValue: number;
};

export type ForecastResponse = {
  data: ForecastPeriodData[];
  summary: ForecastSummary;
};
