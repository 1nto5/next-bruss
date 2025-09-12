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
  const departmentFilter = searchParams.get('department'); // Optional department filter

  let dateRanges: DateRange[] = [];

  try {
    // Fetch department rates from department_configs collection
    const departmentsColl = await dbc('department_configs');
    const departments = await departmentsColl
      .find({ isActive: true })
      .toArray();
    
    // Create a map of department id to hourly rate and validate all have rates
    const departmentRates: Record<string, number> = {};
    const missingRates: string[] = [];
    
    departments.forEach((dept) => {
      const hourlyRate = dept.configs?.overtime?.hourlyRate;
      if (typeof hourlyRate === 'number' && hourlyRate > 0) {
        departmentRates[dept.id] = hourlyRate;
      } else {
        missingRates.push(dept.name || dept.id);
      }
    });

    // Return error if any department is missing hourly rate configuration
    if (missingRates.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing hourly rate configuration',
          details: `Departments without configured rates: ${missingRates.join(', ')}`,
          code: 'MISSING_DEPARTMENT_RATES',
          missingDepartments: missingRates
        },
        { status: 400 }
      );
    }

    // Helper function to get hourly rate for a department
    const getDepartmentRate = (departmentId: string): number => {
      const rate = departmentRates[departmentId];
      if (!rate) {
        throw new Error(`Missing hourly rate for department: ${departmentId}`);
      }
      return rate;
    };

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

    // Add department filtering
    if (departmentFilter) {
      query.$and = query.$and || [];
      query.$and.push({ department: departmentFilter });
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

      // Calculate department-specific data for forecast
      const forecastDepartmentData: Record<string, { hours: number; cost: number; count: number }> = {};
      let forecastHours = 0;
      let forecastCost = 0;
      
      forecast.forEach((req) => {
        const duration =
          (new Date(req.to).getTime() - new Date(req.from).getTime()) /
          (1000 * 60 * 60);
        const hours = (duration * req.numberOfEmployees) / (req.numberOfShifts || 1);
        const departmentRate = getDepartmentRate(req.department);
        const cost = hours * departmentRate;
        
        // Initialize department data if not exists
        if (!forecastDepartmentData[req.department]) {
          forecastDepartmentData[req.department] = { hours: 0, cost: 0, count: 0 };
        }
        
        // Add to department totals
        forecastDepartmentData[req.department].hours += hours;
        forecastDepartmentData[req.department].cost += cost;
        forecastDepartmentData[req.department].count += 1;
        
        // Add to overall totals
        forecastHours += hours;
        forecastCost += cost;
      });

      // Calculate department-specific data for historical
      const historicalDepartmentData: Record<string, { hours: number; cost: number; count: number }> = {};
      let historicalHours = 0;
      let historicalCost = 0;
      
      historical.forEach((req) => {
        const duration =
          (new Date(req.to).getTime() - new Date(req.from).getTime()) /
          (1000 * 60 * 60);
        const employees = req.actualEmployeesWorked || req.numberOfEmployees;
        const hours = (duration * employees) / (req.numberOfShifts || 1);
        const departmentRate = getDepartmentRate(req.department);
        const cost = hours * departmentRate;
        
        // Initialize department data if not exists
        if (!historicalDepartmentData[req.department]) {
          historicalDepartmentData[req.department] = { hours: 0, cost: 0, count: 0 };
        }
        
        // Add to department totals
        historicalDepartmentData[req.department].hours += hours;
        historicalDepartmentData[req.department].cost += cost;
        historicalDepartmentData[req.department].count += 1;
        
        // Add to overall totals
        historicalHours += hours;
        historicalCost += cost;
      });

      // Convert department data to arrays with department info
      const forecastDepartmentBreakdown = Object.entries(forecastDepartmentData).map(([deptId, data]) => {
        const dept = departments.find(d => d.id === deptId);
        return {
          departmentId: deptId,
          departmentName: dept?.name || deptId,
          hours: Math.round(data.hours * 100) / 100,
          cost: Math.round(data.cost * 100) / 100,
          count: data.count,
          hourlyRate: getDepartmentRate(deptId)
        };
      });

      const historicalDepartmentBreakdown = Object.entries(historicalDepartmentData).map(([deptId, data]) => {
        const dept = departments.find(d => d.id === deptId);
        return {
          departmentId: deptId,
          departmentName: dept?.name || deptId,
          hours: Math.round(data.hours * 100) / 100,
          cost: Math.round(data.cost * 100) / 100,
          count: data.count,
          hourlyRate: getDepartmentRate(deptId)
        };
      });

      return {
        period: periodName,
        forecastCount: forecast.length,
        historicalCount: historical.length,
        forecastHours: Math.round(forecastHours * 100) / 100,
        historicalHours: Math.round(historicalHours * 100) / 100,
        forecastCost: Math.round(forecastCost * 100) / 100,
        historicalCost: Math.round(historicalCost * 100) / 100,
        totalHours: Math.round((forecastHours + historicalHours) * 100) / 100,
        totalCost: Math.round((forecastCost + historicalCost) * 100) / 100,
        totalCount: forecast.length + historical.length,
        departmentBreakdown: {
          forecast: forecastDepartmentBreakdown,
          historical: historicalDepartmentBreakdown,
        },
        details: {
          forecast: forecast.map((req) => ({
            _id: req._id,
            internalId: req.internalId,
            status: req.status,
            department: req.department,
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
            department: req.department,
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

    // Calculate department totals across all periods
    const departmentTotals: Record<string, { 
      departmentId: string;
      departmentName: string;
      forecastHours: number;
      forecastCost: number;
      forecastCount: number;
      historicalHours: number;
      historicalCost: number;
      historicalCount: number;
      hourlyRate: number;
    }> = {};

    groupedData.forEach((period: any) => {
      // Process forecast department breakdown
      period.departmentBreakdown.forecast.forEach((dept: any) => {
        if (!departmentTotals[dept.departmentId]) {
          departmentTotals[dept.departmentId] = {
            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            forecastHours: 0,
            forecastCost: 0,
            forecastCount: 0,
            historicalHours: 0,
            historicalCost: 0,
            historicalCount: 0,
            hourlyRate: dept.hourlyRate,
          };
        }
        departmentTotals[dept.departmentId].forecastHours += dept.hours;
        departmentTotals[dept.departmentId].forecastCost += dept.cost;
        departmentTotals[dept.departmentId].forecastCount += dept.count;
      });

      // Process historical department breakdown
      period.departmentBreakdown.historical.forEach((dept: any) => {
        if (!departmentTotals[dept.departmentId]) {
          departmentTotals[dept.departmentId] = {
            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            forecastHours: 0,
            forecastCost: 0,
            forecastCount: 0,
            historicalHours: 0,
            historicalCost: 0,
            historicalCount: 0,
            hourlyRate: dept.hourlyRate,
          };
        }
        departmentTotals[dept.departmentId].historicalHours += dept.hours;
        departmentTotals[dept.departmentId].historicalCost += dept.cost;
        departmentTotals[dept.departmentId].historicalCount += dept.count;
      });
    });

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
        totalForecastCost: groupedData.reduce(
          (sum: number, period: any) => sum + period.forecastCost,
          0,
        ),
        totalHistoricalCost: groupedData.reduce(
          (sum: number, period: any) => sum + period.historicalCost,
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
        departmentTotals: Object.values(departmentTotals).map((dept) => ({
          ...dept,
          forecastHours: Math.round(dept.forecastHours * 100) / 100,
          forecastCost: Math.round(dept.forecastCost * 100) / 100,
          historicalHours: Math.round(dept.historicalHours * 100) / 100,
          historicalCost: Math.round(dept.historicalCost * 100) / 100,
        })),
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
