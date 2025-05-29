import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { generateDataMatrix } from './bwip-loader';

interface GeneratePdfOptions {
  items: string[];
  title: string;
  pageSize: 'standard' | 'a4' | 'a3';
  codeSize?: number;
  fontSize?: number;
  spacing?: number;
  codeType?: 'qr' | 'barcode' | 'dmc';
  orientation?: 'portrait' | 'landscape';
}

export async function codesPdfGenerator({
  items,
  title,
  pageSize,
  codeSize,
  fontSize,
  spacing,
  codeType = 'qr',
  orientation = 'portrait',
}: GeneratePdfOptions): Promise<void> {
  let format: any = pageSize;

  // Special handling for DMC - fixed 15x15 mm size
  if (codeType === 'dmc') {
    format = [15, 15];
    orientation = 'portrait';
    codeSize = 10;
    fontSize = 0;
    spacing = 0;
  } else if (pageSize === 'standard') {
    format = orientation === 'portrait' ? [125, 104] : [104, 125];
  }

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: format,
  });

  doc.setProperties({
    title: title,
    subject:
      codeType === 'qr'
        ? 'QR Codes'
        : codeType === 'barcode'
          ? 'Barcodes'
          : 'DMC Codes',
    creator: 'Code Generator',
    author: 'BRUSS',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  const defaultCodeSizes = {
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

  // Barcode dimensions are different - they're typically wider than tall
  const defaultBarcodeSizes = {
    standard: { width: 85, height: 50 },
    a4: { width: 190, height: 100 },
    a3:
      orientation === 'portrait'
        ? { width: 270, height: 150 }
        : { width: 380, height: 180 }, // Increased size for A3 landscape
  };

  const actualCodeSize = codeSize || defaultCodeSizes[pageSize];
  const actualFontSize = fontSize || defaultFontSizes[pageSize];
  const actualSpacing = spacing || defaultSpacings[pageSize];

  const barcodeSize = defaultBarcodeSizes[pageSize];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cleanedItem = item.replace(/\s+/g, '').trim();

    if (i > 0) {
      doc.addPage();
    }

    try {
      if (codeType === 'qr') {
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(cleanedItem, {
          margin: 0,
          width: 200,
          color: {
            dark: '#000',
            light: '#fff',
          },
        });

        let qrY = pageSize === 'standard' ? 10 : 20;

        const qrX = centerX - actualCodeSize / 2;
        doc.addImage(
          qrCodeDataUrl,
          'PNG',
          qrX,
          qrY,
          actualCodeSize,
          actualCodeSize,
        );

        doc.setFontSize(actualFontSize);
        doc.setFont('helvetica', 'bold');

        const uppercaseText = cleanedItem.toUpperCase();
        const textWidth =
          (doc.getStringUnitWidth(uppercaseText) * actualFontSize) /
          doc.internal.scaleFactor;
        const textX = centerX - textWidth / 2;

        doc.text(uppercaseText, textX, qrY + actualCodeSize + actualSpacing);
      } else if (codeType === 'dmc') {
        // Generate Data Matrix Code
        const canvas = document.createElement('canvas');

        await generateDataMatrix(cleanedItem, canvas);

        const dmcDataUrl = canvas.toDataURL('image/png');

        // For DMC, center the 10x10 code on 15x15 paper
        const dmcCodeSize = 10;
        const dmcX = centerX - dmcCodeSize / 2;
        const dmcY = (pageHeight - dmcCodeSize) / 2;

        doc.addImage(dmcDataUrl, 'PNG', dmcX, dmcY, dmcCodeSize, dmcCodeSize);

        // No text for DMC codes - only the code is printed
      } else {
        // Generate barcode
        // Create a temporary canvas element to generate the barcode
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, cleanedItem, {
          format: 'CODE128',
          displayValue: false,
          margin: 0,
        });

        const barcodeDataUrl = canvas.toDataURL('image/png');

        let barcodeY = pageSize === 'standard' ? 10 : 30;

        // Calculate barcode dimensions based on actualCodeSize and orientation
        let barcodeWidth, barcodeHeight;

        if (codeType === 'barcode') {
          if (pageSize === 'a3' && orientation === 'landscape') {
            // Special case for A3 landscape
            barcodeWidth = actualCodeSize * 1.4; // Make it wider for landscape
            barcodeHeight = actualCodeSize * 0.5; // Adjust height accordingly
          } else {
            barcodeWidth = actualCodeSize;
            barcodeHeight = actualCodeSize * 0.6;
          }
        } else {
          barcodeWidth = barcodeSize.width;
          barcodeHeight = barcodeSize.height;
        }

        // Center and add the barcode
        const barcodeX = centerX - barcodeWidth / 2;
        doc.addImage(
          barcodeDataUrl,
          'PNG',
          barcodeX,
          barcodeY,
          barcodeWidth,
          barcodeHeight,
        );

        // Add text below barcode
        doc.setFontSize(actualFontSize);
        doc.setFont('helvetica', 'bold');

        const uppercaseText = cleanedItem.toUpperCase();
        const textWidth =
          (doc.getStringUnitWidth(uppercaseText) * actualFontSize) /
          doc.internal.scaleFactor;
        const textX = centerX - textWidth / 2;

        doc.text(
          uppercaseText,
          textX,
          barcodeY + barcodeHeight + actualSpacing,
        );
      }
    } catch (error) {
      console.error(
        `Error generating ${codeType} for item "${cleanedItem}":`,
        error,
      );
    }
  }

  const codeTypeText =
    codeType === 'qr' ? 'QR' : codeType === 'barcode' ? 'Barcode' : 'DMC';
  const orientationText = orientation === 'portrait' ? 'P' : 'L';
  const fileName = `${pageSize}-${orientationText}-${codeTypeText}-${title.replace(/\s+/g, '-')}`;
  doc.save(`${fileName}.pdf`);
}
