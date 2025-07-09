import { createTransport } from 'nodemailer';

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

const HTML_FOOTER = `<br/><br/><hr/>Wiadomość wysłana automatycznie. Nie odpowiadaj. / Message sent automatically. Do not reply. / Nachricht automatisch gesendet. Bitte nicht antworten.`;

const mailer = async (mailOptions: any) => {
  // Add the default "from" address to the options
  let originalTo = mailOptions.to;
  let to = originalTo;
  let subject = mailOptions.subject || '';

  const isDevMode = process.env.NODE_ENV === 'development';

  if (isDevMode) {
    // Save original recipient but send to developer
    to = 'adrian.antosiak@bruss-group.com';
    // Add original recipient information to subject
    subject = `DEV: -> ${originalTo} - ${subject}`;
  }

  const completeMailOptions = {
    from: 'no.reply@bruss-group.com',
    ...mailOptions,
    to,
    subject,
  };

  // Initialize HTML content or create empty if not provided
  let htmlContent = completeMailOptions.html || '';

  // Add dev mode banner if in development
  if (isDevMode) {
    htmlContent =
      `<div style="background-color: #ffff99; padding: 10px; margin-bottom: 15px; border: 1px solid #e5e500;">
      <strong>DEV MODE</strong>: This email was originally intended for: ${originalTo}
    </div>` + htmlContent;
  }

  // Always add HTML footer
  completeMailOptions.html = htmlContent + HTML_FOOTER;

  try {
    const info = await transporter.sendMail(completeMailOptions);
    return info;
  } catch (error) {
    console.error('Error occurred during sending:', error);
    throw error;
  }
};

export default mailer;
