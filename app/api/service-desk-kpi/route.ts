import { NextResponse } from 'next/server';

export const revalidate = 900; // 15 minutes cache


interface TicketTimeline {
  id: string;
  subject: string;
  technician: string;
  created_time: string;
  closed_time: string | null;
  completion_minutes: number | null;
  within_24h: boolean;
  status: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g., "09"
    const year = searchParams.get('year'); // e.g., "2025"
    
    console.log(`Fetching Service Desk KPI data for ${month ? `${month}/${year}` : 'all time'}...`);
    
    // Optimize fetching strategy based on filtering requirements
    let allTickets = [];
    let currentPage = 1;
    let hasMoreRows = true;
    let totalPagesChecked = 0;
    
    // Adjust max pages based on whether we're filtering by period
    // If filtering by specific month/year, we need less data
    // If no filter (all time), fetch ALL available data
    const maxPages = (month && year) ? 20 : 500; // Increased limit for all historical data
    const rowCount = 100; // Keep high row count per page for efficiency
    
    console.log(`Starting paginated fetch (max ${maxPages} pages, ${rowCount} rows per page)...`);
    
    while (hasMoreRows && totalPagesChecked < maxPages) {
      try {
        const inputData = {
          list_info: { row_count: rowCount, page: currentPage }
        };
        
        const response = await fetch(`${process.env.SERVICEDESK_API_URL}/api/v3/requests?input_data=${encodeURIComponent(JSON.stringify(inputData))}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authtoken': process.env.SERVICEDESK_API_KEY!,
          },
        });
        
        if (!response.ok) {
          console.log(`Failed on page ${currentPage}: ${response.status} ${response.statusText}`);
          break;
        }
        
        const data = await response.json();
        
        if (data.requests && data.requests.length > 0) {
          allTickets = allTickets.concat(data.requests);
          hasMoreRows = data.list_info?.has_more_rows || false;
          console.log(`Page ${currentPage}: Got ${data.requests.length} tickets (Total: ${allTickets.length})`);
          
          // Early termination optimization for monthly queries only
          if (month && year && totalPagesChecked >= 10) {
            // After 10 pages (1000 tickets), check if we have enough recent data
            const recentTickets = allTickets.filter((ticket: any) => {
              if (!ticket.created_time?.display_value) return false;
              const dateParts = ticket.created_time.display_value.split(' ')[0];
              const [day, ticketMonth, ticketYear] = dateParts.split('.');
              return ticketMonth === month.padStart(2, '0') && ticketYear === year;
            });
            
            // If we have a good amount of data for the requested month, we can stop
            if (recentTickets.length >= 50) {
              console.log(`Early termination: Found ${recentTickets.length} tickets for ${month}/${year} after ${totalPagesChecked} pages`);
              break;
            }
          }
        } else {
          hasMoreRows = false;
        }
        
        currentPage++;
        totalPagesChecked++;
        
      } catch (error) {
        console.log(`Error on page ${currentPage}:`, error.message);
        break;
      }
    }
    
    console.log(`Found ${allTickets.length} total tickets across ${totalPagesChecked} pages`);
    
    // Filter for both technicians
    const targetTechnicians = ["Wojciech Bawirsz", "Adrian Antosiak"];
    let technicianTickets = allTickets.filter((ticket: any) => 
      targetTechnicians.includes(ticket.technician?.name)
    );
    
    // Filter by month and year if provided
    if (month && year) {
      technicianTickets = technicianTickets.filter((ticket: any) => {
        if (!ticket.created_time?.display_value) return false;
        
        // Parse created_time format: "DD.MM.YYYY HH:MM"
        const dateParts = ticket.created_time.display_value.split(' ')[0]; // Get date part
        const [day, ticketMonth, ticketYear] = dateParts.split('.');
        
        return ticketMonth === month.padStart(2, '0') && ticketYear === year;
      });
    }
    
    console.log(`Found ${technicianTickets.length} tickets for target technicians ${month && year ? `in ${month}/${year}` : ''}`);
    
    // If filtering by month/year and no tickets found, show available months
    if (month && year && technicianTickets.length === 0) {
      const availableMonths = [...new Set(
        allTickets
          .filter((ticket: any) => targetTechnicians.includes(ticket.technician?.name))
          .map((ticket: any) => {
            if (ticket.created_time?.display_value) {
              const dateParts = ticket.created_time.display_value.split(' ')[0];
              const [day, ticketMonth, ticketYear] = dateParts.split('.');
              return `${ticketMonth}/${ticketYear}`;
            }
            return null;
          })
          .filter(Boolean)
      )].sort();
      
      return NextResponse.json({
        success: false,
        message: `No tickets found for ${month}/${year}`,
        available_periods: availableMonths,
        suggestion: `Try one of these periods: ${availableMonths.slice(0, 5).join(', ')}`
      });
    }
    
    const processedTickets: TicketTimeline[] = [];
    
    // Process each ticket to get timeline data  
    for (const ticket of technicianTickets) {
      try {
        let closedTime = null;
        let completionMinutes = null;
        let within24h = false;
        
        
        // For closed tickets, get detailed ticket info to get resolved/completed times
        if (ticket.status.name === "Closed") {
          try {
            const detailResponse = await fetch(`${process.env.SERVICEDESK_API_URL}/api/v3/requests/${ticket.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authtoken': process.env.SERVICEDESK_API_KEY!,
              },
            });
            
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              const detailedTicket = detailData.request;
              
              // Use resolved_time, completed_time, or last_updated_time from detailed response
              const resolvedTime = detailedTicket?.resolved_time || detailedTicket?.completed_time || detailedTicket?.last_updated_time;
              if (resolvedTime && ticket.created_time) {
                const createdMs = parseInt(ticket.created_time.value);
                const closedMs = parseInt(resolvedTime.value);
                closedTime = resolvedTime.display_value;
                completionMinutes = Math.round((closedMs - createdMs) / (1000 * 60));
                within24h = completionMinutes <= (24 * 60); // 1440 minutes = 24 hours
              }
            }
          } catch (error) {
            console.error(`Error fetching details for ticket ${ticket.id}:`, error);
          }
        }
        
        processedTickets.push({
          id: ticket.id,
          subject: ticket.subject,
          technician: ticket.technician?.name || 'Unknown',
          created_time: ticket.created_time.display_value,
          closed_time: closedTime,
          completion_minutes: completionMinutes,
          within_24h: within24h,
          status: ticket.status.name
        });
        
      } catch (error) {
        console.error(`Error processing ticket ${ticket.id}:`, error);
        // Add ticket without timeline data
        processedTickets.push({
          id: ticket.id,
          subject: ticket.subject,
          technician: ticket.technician?.name || 'Unknown',
          created_time: ticket.created_time.display_value,
          closed_time: null,
          completion_minutes: null,
          within_24h: false,
          status: ticket.status.name
        });
      }
    }
    
    // Calculate combined KPIs for both technicians
    const allClosedTickets = processedTickets.filter(t => t.status === "Closed");
    const closedWithin24h = allClosedTickets.filter(t => t.within_24h);
    
    const avgCompletionMinutes = allClosedTickets
      .filter(t => t.completion_minutes !== null)
      .reduce((sum, t) => sum + (t.completion_minutes || 0), 0) / 
      allClosedTickets.filter(t => t.completion_minutes !== null).length || 0;
    
    return NextResponse.json({
      success: true,
      filter: {
        month: month || null,
        year: year || null,
        period: month && year ? `${month}/${year}` : 'all time'
      },
      kpi_data: {
        total_tickets: processedTickets.length,
        closed_tickets: allClosedTickets.length,
        closed_percentage: processedTickets.length > 0 ? 
          Math.round((allClosedTickets.length / processedTickets.length) * 100) : 0,
        tickets_closed_within_24h: closedWithin24h.length,
        within_24h_percentage: allClosedTickets.length > 0 ? 
          Math.round((closedWithin24h.length / allClosedTickets.length) * 100) : 0,
        avg_completion_minutes: Math.round(avgCompletionMinutes),
        all_tickets: processedTickets
          .sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime()) // All tickets from filtered period, sorted by date
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Service Desk KPI API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}