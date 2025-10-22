'use server';

import { dbc } from '@/lib/db/mongo';

export interface OvertimeSummary {
  currentMonthHours: number;
  totalHours: number;
  pendingMonthHours: number;
  pendingTotalHours: number;
  monthLabel: string;
}

export interface HROvertimeSummary {
  currentMonthHours: number;
  overdueHours: number;
  pendingCurrentMonthHours: number;
  pendingOverdueHours: number;
  monthLabel: string;
}

export async function calculateUnclaimedOvertimeHours(
  userEmail: string,
  selectedMonth?: string,
): Promise<OvertimeSummary> {
  try {
    const coll = await dbc('overtime_submissions');

    // Determine which month to calculate for
    let targetMonth: Date;
    let monthLabel: string;

    if (selectedMonth) {
      // Parse selected month (format: "YYYY-MM")
      const [year, month] = selectedMonth.split('-').map(Number);
      targetMonth = new Date(year, month - 1, 1);
      monthLabel = `${month.toString().padStart(2, '0')}.${year}`;
    } else {
      // Use current month
      const now = new Date();
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      monthLabel = 'bieżącym miesiącu';
    }

    const currentMonth = targetMonth.getMonth();
    const currentYear = targetMonth.getFullYear();

    // Calculate start and end of target month
    const startOfTargetMonth = new Date(currentYear, currentMonth, 1);
    const endOfTargetMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get all overtime submissions for the user, excluding accounted and cancelled
    const allRelevantSubmissions = await coll
      .find({
        submittedBy: userEmail,
        status: { $nin: ['accounted', 'cancelled'] },
      })
      .toArray();

    // Main summary: exclude 'pending' and 'pending-plant-manager'
    const mainSubmissions = allRelevantSubmissions.filter(
      (s) => s.status !== 'pending' && s.status !== 'pending-plant-manager',
    );
    // Pending summary
    const pendingSubmissions = allRelevantSubmissions.filter(
      (s) => s.status === 'pending' || s.status === 'pending-plant-manager',
    );

    // Calculate total hours (excluding pending)
    const totalHours = mainSubmissions.reduce(
      (sum, submission) => sum + submission.hours,
      0,
    );

    // Calculate target month hours (excluding pending)
    const currentMonthHours = mainSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate pending hours (total)
    const pendingTotalHours = pendingSubmissions.reduce(
      (sum, submission) => sum + submission.hours,
      0,
    );

    // Calculate pending hours (month)
    const pendingMonthHours = pendingSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    return {
      currentMonthHours,
      totalHours,
      pendingMonthHours,
      pendingTotalHours,
      monthLabel,
    };
  } catch (error) {
    console.error('Error calculating overtime hours:', error);
    return {
      currentMonthHours: 0,
      totalHours: 0,
      pendingMonthHours: 0,
      pendingTotalHours: 0,
      monthLabel: 'bieżącym miesiącu',
    };
  }
}

export async function calculateEmployeeOvertimeHours(
  userEmail: string,
  selectedMonth?: string,
): Promise<HROvertimeSummary> {
  try {
    const coll = await dbc('overtime_submissions');

    // Determine which month to calculate for
    let targetMonth: Date;
    let monthLabel: string;

    if (selectedMonth) {
      // Parse selected month (format: "YYYY-MM")
      const [year, month] = selectedMonth.split('-').map(Number);
      targetMonth = new Date(year, month - 1, 1);
      monthLabel = `${month.toString().padStart(2, '0')}.${year}`;
    } else {
      // Use current month
      const now = new Date();
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      monthLabel = 'bieżącym miesiącu';
    }

    const currentMonth = targetMonth.getMonth();
    const currentYear = targetMonth.getFullYear();

    // Calculate start and end of target month
    const startOfTargetMonth = new Date(currentYear, currentMonth, 1);
    const endOfTargetMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get all overtime submissions for specific employee, excluding cancelled
    const allRelevantSubmissions = await coll
      .find({
        submittedBy: userEmail,
        status: { $nin: ['cancelled'] },
      })
      .toArray();

    // Split into approved/accounted vs pending
    const approvedSubmissions = allRelevantSubmissions.filter(
      (s) => s.status === 'approved' || s.status === 'accounted',
    );
    const pendingSubmissions = allRelevantSubmissions.filter(
      (s) => s.status === 'pending' || s.status === 'pending-plant-manager',
    );

    // Calculate current month hours (approved/accounted)
    const currentMonthHours = approvedSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate overdue hours (approved but not accounted from previous months)
    const overdueHours = approvedSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate < startOfTargetMonth &&
          submission.status === 'approved'
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate pending current month hours
    const pendingCurrentMonthHours = pendingSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate pending overdue hours (from previous months)
    const pendingOverdueHours = pendingSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return submissionDate < startOfTargetMonth;
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    return {
      currentMonthHours,
      overdueHours,
      pendingCurrentMonthHours,
      pendingOverdueHours,
      monthLabel,
    };
  } catch (error) {
    console.error('Error calculating employee overtime hours:', error);
    return {
      currentMonthHours: 0,
      overdueHours: 0,
      pendingCurrentMonthHours: 0,
      pendingOverdueHours: 0,
      monthLabel: 'bieżącym miesiącu',
    };
  }
}

export async function calculateOrganizationOvertimeHours(
  selectedMonth?: string,
): Promise<HROvertimeSummary> {
  try {
    const coll = await dbc('overtime_submissions');

    // Determine which month to calculate for
    let targetMonth: Date;
    let monthLabel: string;

    if (selectedMonth) {
      // Parse selected month (format: "YYYY-MM")
      const [year, month] = selectedMonth.split('-').map(Number);
      targetMonth = new Date(year, month - 1, 1);
      monthLabel = `${month.toString().padStart(2, '0')}.${year}`;
    } else {
      // Use current month
      const now = new Date();
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      monthLabel = 'bieżącym miesiącu';
    }

    const currentMonth = targetMonth.getMonth();
    const currentYear = targetMonth.getFullYear();

    // Calculate start and end of target month
    const startOfTargetMonth = new Date(currentYear, currentMonth, 1);
    const endOfTargetMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get all overtime submissions excluding cancelled
    const allRelevantSubmissions = await coll
      .find({
        status: { $nin: ['cancelled'] },
      })
      .toArray();

    // Split into approved/accounted vs pending
    const approvedSubmissions = allRelevantSubmissions.filter(
      (s) => s.status === 'approved' || s.status === 'accounted',
    );
    const pendingSubmissions = allRelevantSubmissions.filter(
      (s) => s.status === 'pending' || s.status === 'pending-plant-manager',
    );

    // Calculate current month hours (approved/accounted)
    const currentMonthHours = approvedSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate overdue hours (approved but not accounted from previous months)
    const overdueHours = approvedSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate < startOfTargetMonth &&
          submission.status === 'approved'
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate pending current month hours
    const pendingCurrentMonthHours = pendingSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return (
          submissionDate >= startOfTargetMonth &&
          submissionDate <= endOfTargetMonth
        );
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    // Calculate pending overdue hours (from previous months)
    const pendingOverdueHours = pendingSubmissions
      .filter((submission) => {
        const submissionDate = new Date(submission.date);
        return submissionDate < startOfTargetMonth;
      })
      .reduce((sum, submission) => sum + submission.hours, 0);

    return {
      currentMonthHours,
      overdueHours,
      pendingCurrentMonthHours,
      pendingOverdueHours,
      monthLabel,
    };
  } catch (error) {
    console.error('Error calculating organization overtime hours:', error);
    return {
      currentMonthHours: 0,
      overdueHours: 0,
      pendingCurrentMonthHours: 0,
      pendingOverdueHours: 0,
      monthLabel: 'bieżącym miesiącu',
    };
  }
}
