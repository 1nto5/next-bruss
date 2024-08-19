import clientPromise from '@/lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type RequestBody = {
  to: string;
  content: string;
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ message: 'Only POST requests allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const body: RequestBody = await req.json();

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'mail.bruss-group.com',
    service: 'Exchange',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-password',
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'next@bruss-group.com',
    to: body.to,
    subject: 'Email Subject',
    text: body.content,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return new NextResponse(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Failed to send email' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
