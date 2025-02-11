import { createTransport, SendMailOptions } from 'nodemailer';

const transporter = createTransport({
  host: '10.21.10.241',
  port: 26,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendMail(mailOptions: SendMailOptions): Promise<any> {
  // ...existing code...
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Wiadomość wysłana:', info.messageId);
    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłki:', error);
    throw error;
  }
}

export default { sendMail };
