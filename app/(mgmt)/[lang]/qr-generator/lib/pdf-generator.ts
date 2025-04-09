import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface GeneratePdfOptions {
  items: string[];
  title: string;
  pageSize: 'standard' | 'a4' | 'a3';
  qrSize?: number; // QR code size in mm
  fontSize?: number; // Font size in points
  spacing?: number; // Spacing between QR code and text in mm
}

export async function generateQrCodePdf({
  items,
  title,
  pageSize,
  qrSize,
  fontSize,
  spacing,
}: GeneratePdfOptions): Promise<void> {
  // Handle standard label format with custom dimensions
  let format: any = pageSize;
  if (pageSize === 'standard') {
    format = [125, 104];
  }

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format,
  });

  // Set document properties
  doc.setProperties({
    title: title,
    subject: 'QR Codes',
    creator: 'QR Generator',
    author: 'BRUSS',
  });

  // Define page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculate center position of the page
  const centerX = pageWidth / 2;

  // Get default values based on page format if not specified
  const defaultQrSizes = {
    standard: 85,
    a4: 190, // Increased from 150 to 190
    a3: 270, // Increased from 200 to 270
  };

  const defaultFontSizes = {
    standard: 48,
    a4: 105, // Increased from 65 to 105
    a3: 150, // Increased from 90 to 150
  };

  const defaultSpacings = {
    standard: 22,
    a4: 80, // Increased from 40 to 80 (2x)
    a3: 120, // Increased from 60 to 120 (2x)
  };

  // Use provided values or defaults
  const actualQrSize = qrSize || defaultQrSizes[pageSize];
  const actualFontSize = fontSize || defaultFontSizes[pageSize];
  const actualSpacing = spacing || defaultSpacings[pageSize];

  // Generate QR codes for each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Clean the text - remove excess whitespace but preserve newlines
    const cleanedItem = item
      .replace(/\s+/g, '') // Replace multiple whitespace
      .trim(); // Remove leading/trailing whitespace

    // Add a new page for each item (except the first one)
    if (i > 0) {
      doc.addPage();
    }

    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(cleanedItem, {
        margin: 0,
        width: 200,
        color: {
          dark: '#000',
          light: '#fff',
        },
      });

      // Adjust QR code size based on provided value or defaults
      let qrY = 20; // Default Y position for non-standard formats

      if (pageSize === 'standard') {
        qrY = 10; // Position higher on the page for standard labels
      }

      // Add QR code to PDF
      const qrX = centerX - actualQrSize / 2;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, actualQrSize, actualQrSize);

      // Set font size based on provided value
      doc.setFontSize(actualFontSize);
      doc.setFont('helvetica', 'bold');

      // Calculate text width to center it
      const uppercaseText = cleanedItem.toUpperCase();
      const textWidth =
        (doc.getStringUnitWidth(uppercaseText) * actualFontSize) /
        doc.internal.scaleFactor;
      const textX = centerX - textWidth / 2;

      // Add the text under the QR code with provided spacing
      doc.text(uppercaseText, textX, qrY + actualQrSize + actualSpacing);
    } catch (error) {
      console.error(
        `Error generating QR code for item "${cleanedItem}":`,
        error,
      );
    }
  }

  // Save the PDF with appropriate naming
  const fileName =
    pageSize === 'standard'
      ? `standard-${title.replace(/\s+/g, '-')}`
      : pageSize === 'a4'
        ? `a4-${title.replace(/\s+/g, '-')}`
        : pageSize === 'a3'
          ? `a3-${title.replace(/\s+/g, '-')}`
          : `${title.replace(/\s+/g, '-')}`;

  doc.save(`${fileName}.pdf`);
}
