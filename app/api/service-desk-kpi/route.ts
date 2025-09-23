import { NextResponse } from 'next/server';

export const revalidate = 900; // 15 minutes cache

interface ServiceDeskTicket {
  id: string;
  subject: string;
  technician?: {
    name: string;
  };
  created_time: {
    value: string;
    display_value: string;
  };
  status: {
    name: string;
  };
  resolved_time?: {
    value: string;
    display_value: string;
  };
  completed_time?: {
    value: string;
    display_value: string;
  };
  last_updated_time?: {
    value: string;
    display_value: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthName = searchParams.get('month'); // e.g., "May", "Jun"
    const year = searchParams.get('year'); // e.g., "2025"

    // Map month names to numbers
    const monthToNumber: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };

    // Convert month name to number
    const month = monthName ? monthToNumber[monthName] : null;

    if (!month || !year) {
      return new NextResponse('0', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Fetch tickets from ServiceDesk API
    let allTickets: ServiceDeskTicket[] = [];
    let currentPage = 1;
    let hasMoreRows = true;
    let totalPagesChecked = 0;
    const maxPages = 50;
    const rowCount = 100;

    while (hasMoreRows && totalPagesChecked < maxPages) {
      try {
        const inputData = {
          list_info: { row_count: rowCount, page: currentPage },
        };

        const response = await fetch(
          `${process.env.SERVICEDESK_API_URL}/api/v3/requests?input_data=${encodeURIComponent(JSON.stringify(inputData))}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authtoken': process.env.SERVICEDESK_API_KEY!,
            },
          },
        );

        if (!response.ok) {
          break;
        }

        const data = await response.json();

        if (data.requests && data.requests.length > 0) {
          allTickets = allTickets.concat(data.requests);
          hasMoreRows = data.list_info?.has_more_rows || false;

          // Early termination for monthly queries
          if (totalPagesChecked >= 10) {
            const recentTickets = allTickets.filter(
              (ticket: ServiceDeskTicket) => {
                if (!ticket.created_time?.display_value) return false;
                const dateParts =
                  ticket.created_time.display_value.split(' ')[0];
                const [, ticketMonth, ticketYear] = dateParts.split('.');
                return (
                  ticketMonth === month.padStart(2, '0') && ticketYear === year
                );
              },
            );

            if (recentTickets.length >= 50) {
              break;
            }
          }
        } else {
          hasMoreRows = false;
        }

        currentPage++;
        totalPagesChecked++;
      } catch (error) {
        break;
      }
    }

    // Filter for target technicians
    const targetTechnicians = ['Wojciech Bawirsz', 'Adrian Antosiak'];
    let technicianTickets = allTickets.filter(
      (ticket: ServiceDeskTicket) =>
        ticket.technician?.name &&
        targetTechnicians.includes(ticket.technician.name),
    );

    // Filter by month and year
    technicianTickets = technicianTickets.filter(
      (ticket: ServiceDeskTicket) => {
        if (!ticket.created_time?.display_value) return false;
        const dateParts = ticket.created_time.display_value.split(' ')[0];
        const [, ticketMonth, ticketYear] = dateParts.split('.');
        return ticketMonth === month.padStart(2, '0') && ticketYear === year;
      },
    );

    // If no tickets found, return 0
    if (technicianTickets.length === 0) {
      return new NextResponse('0', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Process tickets for 24h resolution calculation
    let closedTickets = 0;
    let closedWithin24h = 0;

    for (const ticket of technicianTickets) {
      if (ticket.status.name === 'Closed') {
        closedTickets++;

        try {
          const detailResponse = await fetch(
            `${process.env.SERVICEDESK_API_URL}/api/v3/requests/${ticket.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authtoken': process.env.SERVICEDESK_API_KEY!,
              },
            },
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            const detailedTicket = detailData.request;

            const resolvedTime =
              detailedTicket?.resolved_time ||
              detailedTicket?.completed_time ||
              detailedTicket?.last_updated_time;
            if (resolvedTime && ticket.created_time) {
              const createdMs = parseInt(ticket.created_time.value);
              const closedMs = parseInt(resolvedTime.value);
              const completionMinutes = Math.round(
                (closedMs - createdMs) / (1000 * 60),
              );

              if (completionMinutes <= 24 * 60) {
                closedWithin24h++;
              }
            }
          }
        } catch (error) {
          // Ignore individual ticket errors
        }
      }
    }

    // Calculate percentage of tickets resolved within 24 hours
    const within24hPercentage =
      closedTickets > 0
        ? Math.round((closedWithin24h / closedTickets) * 100)
        : 0;

    // Always return only the percentage value
    return new NextResponse(within24hPercentage.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new NextResponse('0', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
