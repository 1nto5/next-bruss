'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Extract the request body
    const body = await req.json();
    const {
      identifier,
      quantity,
      printHydraLabelAipIp,
      printHydraLabelAipWorkplacePosition,
    } = body;

    if (!printHydraLabelAipIp) {
      return NextResponse.json(
        { error: 'AIP IP is required' },
        { status: 400 },
      );
    }

    // Forward the request to the actual API endpoint
    const response = await fetch(
      `http://${printHydraLabelAipIp}:5000/run-aip-print-automation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ad126ea0-a92b-4ce5-9c77-e8d9024d9867',
        },
        body: JSON.stringify({
          identifier,
          quantity,
          workplace_position: printHydraLabelAipWorkplacePosition,
        }),
      },
    );

    // Get the response data
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in Hydra label proxy:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Hydra print server' },
      { status: 500 },
    );
  }
}
