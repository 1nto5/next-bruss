import { DepartmentConfig, OvertimeType } from './types';

export type OrdersSummary = {
  totalHours: number;
  totalCost: number;
};

/**
 * Calculate overtime orders summary from filtered orders array.
 * This ensures the summary matches the filtered data being displayed.
 */
export function calculateOrdersSummary(
  orders: OvertimeType[],
  departments: DepartmentConfig[],
): OrdersSummary {
  try {
    let totalHours = 0;
    let totalCost = 0;

    // Calculate totals from each order
    for (const order of orders) {
      const fromDate = new Date(order.from);
      const toDate = new Date(order.to);
      const numberOfEmployees = order.numberOfEmployees || 0;
      const numberOfShifts = order.numberOfShifts || 1;

      // Calculate hours per employee
      const hoursPerEmployee =
        Math.round(
          ((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60)) * 100,
        ) / 100;

      // Calculate total hours for this order
      const orderTotalHours =
        (hoursPerEmployee * numberOfEmployees) / numberOfShifts;

      totalHours += orderTotalHours;

      // Calculate cost if department has hourly rate
      if (order.department) {
        const department = departments.find(
          (d) => d.value === order.department,
        );
        if (department?.hourlyRate) {
          totalCost += orderTotalHours * department.hourlyRate;
        }
      }
    }

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  } catch (error) {
    console.error('Error calculating orders summary:', error);
    return {
      totalHours: 0,
      totalCost: 0,
    };
  }
}
