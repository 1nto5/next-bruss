import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface GeneratePdfOptions {
  items: string[];
  title: string;
  pageSize: 'standard' | 'a4' | 'a3';
  qrSize?: number;
  fontSize?: number;
  spacing?: number;
}

export async function generateQrCodePdf({
  items,
  title,
  pageSize,
  qrSize,
  fontSize,
  spacing,
}: GeneratePdfOptions): Promise<void> {
  let format: any = pageSize;
  if (pageSize === 'standard') {
    format = [125, 104];
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format,
  });

  doc.setProperties({
    title: title,
    subject: 'QR Codes',
    creator: 'QR Generator',
    author: 'BRUSS',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  const defaultQrSizes = {
    standard: 85,
    a4: 190,
    a3: 270,
  };

  const defaultFontSizes = {
    standard: 48,
    a4: 105,
    a3: 150,
  };

  const defaultSpacings = {
    standard: 22,
    a4: 80,
    a3: 120,
  };

  const actualQrSize = qrSize || defaultQrSizes[pageSize];
  const actualFontSize = fontSize || defaultFontSizes[pageSize];
  const actualSpacing = spacing || defaultSpacings[pageSize];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cleanedItem = item.replace(/\s+/g, '').trim();

    if (i > 0) {
      doc.addPage();
    }

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(cleanedItem, {
        margin: 0,
        width: 200,
        color: {
          dark: '#000',
          light: '#fff',
        },
      });

      let qrY = pageSize === 'standard' ? 10 : 20;

      const qrX = centerX - actualQrSize / 2;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, actualQrSize, actualQrSize);

      doc.setFontSize(actualFontSize);
      doc.setFont('helvetica', 'bold');

      const uppercaseText = cleanedItem.toUpperCase();
      const textWidth =
        (doc.getStringUnitWidth(uppercaseText) * actualFontSize) /
        doc.internal.scaleFactor;
      const textX = centerX - textWidth / 2;

      doc.text(uppercaseText, textX, qrY + actualQrSize + actualSpacing);
    } catch (error) {
      console.error(
        `Error generating QR code for item "${cleanedItem}":`,
        error,
      );
    }
  }

  const fileName = `${pageSize}-${title.replace(/\s+/g, '-')}`;
  doc.save(`${fileName}.pdf`);
}
