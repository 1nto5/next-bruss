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

const FOOTER_TEXT =
  '\n\n--\nWiadomość wysłana automatycznie. Nie odpowiadaj. / Message sent automatically. Do not reply. / Nachricht automatisch gesendet. Bitte nicht antworten.';

const mailer = async (mailOptions: any) => {
  // Add the default "from" address to the options
  const completeMailOptions = {
    from: 'no-reply@bruss-group.com',
    ...mailOptions,
  };

  // Append footer to text version if exists, otherwise, create it.
  if (completeMailOptions.text) {
    completeMailOptions.text += FOOTER_TEXT;
  } else {
    completeMailOptions.text = FOOTER_TEXT.trim();
  }

  if (completeMailOptions.html) {
    completeMailOptions.html += `<br/><br/><hr/>Wiadomość wysłana automatycznie przez: / Automatically sent by: / Automatisch gesendet von: <a href="http://next.mrg700.bruss-group.com">BRUSS</a>`;
  }

  try {
    const info = await transporter.sendMail(completeMailOptions);
    return info;
  } catch (error) {
    console.error('Error occurred during sending:', error);
    throw error;
  }
};

export default mailer;
