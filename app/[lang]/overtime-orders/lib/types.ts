import { EmployeeType } from '@/lib/types/employee-types';

export type DepartmentConfig = {
  _id: string;
  value: string;        // kebab-case English name (e.g., "form-service")
  name: string;         // English display name (e.g., "Form Service") 
  namePl: string;       // Polish display name (e.g., "Serwis form")
  nameDe: string;       // German display name (e.g., "Formservice")
  hourlyRate: number;
  currency: string;
};

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
  department?: string; // Department selection (matches DepartmentConfig.value)
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

export type DepartmentBreakdown = {
  departmentId: string;
  departmentName: string;
  hours: number;
  cost: number;
  count: number;
  hourlyRate: number;
};

export type ForecastPeriodData = {
  period: string;
  forecastCount: number;
  historicalCount: number;
  forecastHours: number;
  historicalHours: number;
  forecastCost: number;
  historicalCost: number;
  totalHours: number;
  totalCost: number;
  totalCount: number;
  departmentBreakdown: {
    forecast: DepartmentBreakdown[];
    historical: DepartmentBreakdown[];
  };
  details: {
    forecast: ForecastRequestDetail[];
    historical: ForecastRequestDetail[];
  };
};

export type DepartmentTotal = {
  departmentId: string;
  departmentName: string;
  forecastHours: number;
  forecastCost: number;
  forecastCount: number;
  historicalHours: number;
  historicalCost: number;
  historicalCount: number;
  hourlyRate: number;
};

export type ForecastSummary = {
  totalForecastHours: number;
  totalHistoricalHours: number;
  totalForecastCost: number;
  totalHistoricalCost: number;
  totalForecastCount: number;
  totalHistoricalCount: number;
  departmentTotals: DepartmentTotal[];
  filterType: ForecastFilterType;
  year: number;
  startValue: number;
  endValue: number;
};

export type ForecastResponse = {
  data: ForecastPeriodData[];
  summary: ForecastSummary;
};

// Helper function to display department name (returns English name as fallback)
export function getDepartmentDisplayName(departmentValue: string): string {
  return departmentValue
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
