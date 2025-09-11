import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

interface DateRange {
  start: Date;
  end: Date;
}

// Helper function to get week start and end dates
function getWeekRange(year: number, week: number): DateRange {
  const jan1 = new Date(year, 0, 1);
  const daysToAdd = (week - 1) * 7;
  const weekStart = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  // Adjust to Monday of the week
  const dayOfWeek = weekStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}

// Helper function to get month start and end dates
function getMonthRange(year: number, month: number): DateRange {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

// Helper function to get year start and end dates
function getYearRange(year: number): DateRange {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  // Parse filter parameters
  const filterType = searchParams.get('filterType') || 'week'; // 'week', 'month', 'year'
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );
  const startValue = parseInt(searchParams.get('startValue') || '1');
  const endValue = parseInt(
    searchParams.get('endValue') || startValue.toString(),
  );
  const userEmail = searchParams.get('userEmail');

  let dateRanges: DateRange[] = [];

  try {
    // Generate date ranges based on filter type
    if (filterType === 'week') {
      for (let week = startValue; week <= endValue; week++) {
        dateRanges.push(getWeekRange(year, week));
      }
    } else if (filterType === 'month') {
      for (let month = startValue; month <= endValue; month++) {
        dateRanges.push(getMonthRange(year, month));
      }
    } else if (filterType === 'year') {
      for (let yearValue = startValue; yearValue <= endValue; yearValue++) {
        dateRanges.push(getYearRange(yearValue));
      }
    }

    // Build MongoDB query
    const query: any = {};

    // Filter by date ranges
    if (dateRanges.length > 0) {
      query.$or = dateRanges.map((range) => ({
        $or: [
          { from: { $gte: range.start, $lte: range.end } },
          { to: { $gte: range.start, $lte: range.end } },
          {
            $and: [
              { from: { $lte: range.start } },
              { to: { $gte: range.end } },
            ],
          },
        ],
      }));
    }

    // Add user email filtering for draft documents
    if (userEmail) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { status: { $ne: 'draft' } },
          { $and: [{ status: 'draft' }, { requestedBy: userEmail }] },
        ],
      });
    }

    const coll = await dbc('overtime_orders');
    const overtimeRequests = await coll.find(query).sort({ from: 1 }).toArray();

    // Group data by time periods for chart display
    const allGroupedData = dateRanges.map((range, index) => {
      const periodName =
        filterType === 'week'
          ? `W${startValue + index}/${year}`
          : filterType === 'month'
            ? `${year}/${String(startValue + index).padStart(2, '0')}`
            : `${startValue + index}`;

      const periodRequests = overtimeRequests.filter((request) => {
        const requestStart = new Date(request.from);
        const requestEnd = new Date(request.to);

        return (
          (requestStart >= range.start && requestStart <= range.end) ||
          (requestEnd >= range.start && requestEnd <= range.end) ||
          (requestStart <= range.start && requestEnd >= range.end)
        );
      });

      // Categorize by status (exclude cancelled orders)
      const forecast = periodRequests.filter(
        (r) => r.status === 'forecast' || r.status === 'pending',
      );
      const historical = periodRequests.filter(
        (r) =>
          r.status === 'approved' ||
          r.status === 'completed' ||
          r.status === 'accounted',
      );

      // Calculate totals
      const forecastHours = forecast.reduce((total, req) => {
        const duration =
          (new Date(req.to).getTime() - new Date(req.from).getTime()) /
          (1000 * 60 * 60);
        return (
          total + (duration * req.numberOfEmployees) / (req.numberOfShifts || 1)
        );
      }, 0);

      const historicalHours = historical.reduce((total, req) => {
        const duration =
          (new Date(req.to).getTime() - new Date(req.from).getTime()) /
          (1000 * 60 * 60);
        const employees = req.actualEmployeesWorked || req.numberOfEmployees;
        return total + (duration * employees) / (req.numberOfShifts || 1);
      }, 0);

      return {
        period: periodName,
        forecastCount: forecast.length,
        historicalCount: historical.length,
        forecastHours: Math.round(forecastHours * 100) / 100,
        historicalHours: Math.round(historicalHours * 100) / 100,
        totalHours: Math.round((forecastHours + historicalHours) * 100) / 100,
        totalCount: forecast.length + historical.length,
        details: {
          forecast: forecast.map((req) => ({
            _id: req._id,
            internalId: req.internalId,
            status: req.status,
            from: req.from,
            to: req.to,
            numberOfEmployees: req.numberOfEmployees,
            responsibleEmployee: req.responsibleEmployee,
            reason: req.reason,
          })),
          historical: historical.map((req) => ({
            _id: req._id,
            internalId: req.internalId,
            status: req.status,
            from: req.from,
            to: req.to,
            numberOfEmployees: req.numberOfEmployees,
            actualEmployeesWorked: req.actualEmployeesWorked,
            responsibleEmployee: req.responsibleEmployee,
            reason: req.reason,
          })),
        },
      };
    });

    // Filter out periods with no data (don't show future weeks with no orders)
    const groupedData = allGroupedData.filter(
      (period) => period.forecastCount > 0 || period.historicalCount > 0,
    );

    return NextResponse.json({
      data: groupedData,
      summary: {
        totalForecastHours: groupedData.reduce(
          (sum: number, period: any) => sum + period.forecastHours,
          0,
        ),
        totalHistoricalHours: groupedData.reduce(
          (sum: number, period: any) => sum + period.historicalHours,
          0,
        ),
        totalForecastCount: groupedData.reduce(
          (sum: number, period: any) => sum + period.forecastCount,
          0,
        ),
        totalHistoricalCount: groupedData.reduce(
          (sum: number, period: any) => sum + period.historicalCount,
          0,
        ),
        filterType,
        year,
        startValue,
        endValue,
      },
    });
  } catch (error) {
    console.error('api/overtime-orders/forecast: ' + error);
    return NextResponse.json(
      { error: 'overtime-orders forecast api error' },
      { status: 503 },
    );
  }
}
