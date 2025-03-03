import { createTransport, SendMailOptions, SentMessageInfo } from 'nodemailer';

const config =
  process.env.NODE_ENV === 'development'
    ? {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      };

const transporter = createTransport(config);

const FOOTER_TEXT =
  '\n\n--\nWiadomość wysłana automatycznie. Nie odpowiadaj. / Message sent automatically. Do not reply. / Nachricht automatisch gesendet. Bitte nicht antworten.';

export default async function sendMail(
  mailOptions: SendMailOptions,
): Promise<SentMessageInfo> {
  // Append footer to text version if exists, otherwise, create it.
  if (mailOptions.text) {
    mailOptions.text += FOOTER_TEXT;
  } else {
    mailOptions.text = FOOTER_TEXT.trim();
  }

  if (mailOptions.html) {
    mailOptions.html += `<br/><br/><hr/>Wiadomość wysłana automatycznie przez: / Automatically sent by: / Automatisch gesendet von: <a href="http://next.mrg700.bruss-group.com">Next BRUSS</a>`;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error occurred during sending:', error);
    throw error;
  }
}
