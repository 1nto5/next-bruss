import mailer from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if the request comes from localhost
  const host = request.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json(
      { error: 'Access forbidden. Only localhost can access this function.' },
      { status: 403 },
    );
  }

  // Get parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const to = searchParams.get('to');
  const subject = searchParams.get('subject') || 'System message';
  const html = searchParams.get('html') || 'Message content was not provided.';

  // Check if recipient was specified
  if (!to) {
    return NextResponse.json(
      { error: 'Missing "to" parameter (recipient)' },
      { status: 400 },
    );
  }

  try {
    // Send message with specified parameters
    const mailOptions = {
      to,
      subject,
      html,
    };
    const info = await mailer(mailOptions);
    return NextResponse.json({ message: 'Message sent', info });
  } catch (error) {
    console.error('Error while sending message:', error);
    return NextResponse.json(
      { error: 'Error while sending message', details: error },
      { status: 500 },
    );
  }
}
