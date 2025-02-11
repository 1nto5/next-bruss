import mailer from '@/lib/mailer';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Wysyłanie przykładowej wiadomości
    const mailOptions = {
      from: 'no-reply@bruss-group.com', // modyfikuj w razie potrzeby
      to: 'adrian.antosiak@bruss-group.com',
      subject: 'Przykładowa wiadomość',
      text: 'To jest przykładowa wiadomość wysłana przez Next.js endpoint w nowym formacie app router.',
    };
    const info = await mailer.sendMail(mailOptions);
    return NextResponse.json({ message: 'Wiadomość wysłana', info });
  } catch (error) {
    console.error('Błąd podczas wysyłki wiadomości:', error);
    return NextResponse.json(
      { error: 'Błąd podczas wysyłki wiadomości', details: error },
      { status: 500 },
    );
  }
}
