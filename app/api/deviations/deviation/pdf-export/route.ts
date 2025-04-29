import {
  DeviationAreaType,
  DeviationReasonType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import fs from 'fs';
import { jsPDF } from 'jspdf';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import path from 'path';
import QRCode from 'qrcode';

interface GenerateDeviationPdfOptions {
  deviation: DeviationType;
  reasonOptions: DeviationReasonType[];
  areaOptions: DeviationAreaType[];
  lang: string;
  generatedBy?: string;
}

// Translation structure
const translations = {
  title: { pl: 'Karta odchylenia', en: 'Deviation Card' },
  sections: {
    details: { pl: 'Szczegóły odchylenia', en: 'Deviation Details' },
    description: { pl: 'Opis odchylenia', en: 'Deviation Description' },
    actions: { pl: 'Działania korygujące', en: 'Corrective Actions' },
    attachments: { pl: 'Załączniki', en: 'Attachments' },
    approvals: { pl: 'Zatwierdzenia', en: 'Approvals' },
  },
  fields: {
    created: { pl: 'Data utworzenia', en: 'Creation Date' },
    owner: { pl: 'Właściciel', en: 'Owner' },
    number: { pl: 'Nr artykułu', en: 'Article Number' },
    article: { pl: 'Nazwa artykułu', en: 'Article Name' },
    customerNumber: { pl: 'Numer części klienta', en: 'Customer Part Number' },
    customerName: { pl: 'Nazwa części klienta', en: 'Customer Part Name' },
    workplace: { pl: 'Stanowisko', en: 'Workplace' },
    drawingNumber: { pl: 'Nr rysunku', en: 'Drawing Number' },
    quantity: { pl: 'Ilość', en: 'Quantity' },
    charge: { pl: 'Partia', en: 'Batch' },
    period: { pl: 'Okres ważności', en: 'Valid Period' },
    reason: { pl: 'Powód', en: 'Reason' },
    area: { pl: 'Obszar', en: 'Area' },
    customerAuth: { pl: 'Zgoda klienta', en: 'Customer Authorization' },
    specification: { pl: 'Specyfikacja procesu', en: 'Process Specification' },
  },
  approvals: {
    role: { pl: 'Stanowisko', en: 'Position' },
    by: { pl: 'Osoba', en: 'Person' },
    date: { pl: 'Data', en: 'Date' },
    reason: { pl: 'Powód', en: 'Reason' },
    positions: {
      'group-leader': { pl: 'Group Leader', en: 'Group Leader' },
      'quality-manager': { pl: 'Kierownik Jakości', en: 'Quality Manager' },
      'production-manager': {
        pl: 'Kierownik Produkcji',
        en: 'Production Manager',
      },
      'plant-manager': { pl: 'Dyrektor Zakładu', en: 'Plant Manager' },
    },
  },
  footer: { generated: { pl: 'Wygenerowano', en: 'Generated' } },
};

// Helper function for font loading
function loadFonts(doc: jsPDF): void {
  try {
    const reg = fs
      .readFileSync(
        path.join(process.cwd(), 'public/fonts/OpenSans-Regular.ttf'),
      )
      .toString('base64');
    const bold = fs
      .readFileSync(path.join(process.cwd(), 'public/fonts/OpenSans-Bold.ttf'))
      .toString('base64');
    doc.addFileToVFS('OpenSans-Regular.ttf', reg);
    doc.addFileToVFS('OpenSans-Bold.ttf', bold);
    doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
    doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
    doc.setFont('OpenSans', 'normal');
  } catch (error) {
    console.error('Failed to load custom fonts:', error);
    doc.setFont('helvetica', 'normal');
  }
}

async function generateDeviationPdf({
  deviation,
  reasonOptions,
  areaOptions,
  lang,
  generatedBy,
}: GenerateDeviationPdfOptions): Promise<Buffer> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { width, height } = doc.internal.pageSize;
  const margin = 15;

  // Typed extended deviation
  const typedDeviation = deviation as DeviationType;

  // Load fonts
  loadFonts(doc);

  // Helper function to check if we need a page break
  const checkForPageBreak = (neededSpace = 30): boolean => {
    if (y + neededSpace > height - 20) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header with logo
  let logoHeight = 0;
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    const props = doc.getImageProperties(dataUrl);
    const logoWidth = 30;
    logoHeight = (props.height * logoWidth) / props.width;
    doc.addImage(dataUrl, 'PNG', margin, margin, logoWidth, logoHeight);
  } catch (error) {
    console.error('Failed to load logo:', error);
  }

  // QR code
  const qrSize = 36;
  try {
    // Use a default URL if BASE_URL is not defined
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const qr = await QRCode.toDataURL(
      `${baseUrl}/deviations/${deviation._id}`,
      { width: qrSize * 4 },
    );
    doc.addImage(qr, 'PNG', width - margin - qrSize, margin, qrSize, qrSize);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }

  // Title
  const headerHeight = Math.max(logoHeight, qrSize);
  const titleY = margin + headerHeight / 2 - 2;
  doc.setFont('OpenSans', 'bold').setFontSize(16).setTextColor(0);
  doc.text(translations.title.pl, width / 2, titleY, { align: 'center' });
  doc.setFont('OpenSans', 'normal').setFontSize(10);
  doc.text(translations.title.en, width / 2, titleY + 6, { align: 'center' });

  let y = margin + headerHeight + 10;
  doc.setFontSize(10).setFont('OpenSans', 'normal').setTextColor(0);

  // Section: Details header
  doc.setFont('OpenSans', 'bold').setFontSize(12);
  doc.text(
    `${translations.sections.details.pl} / ${translations.sections.details.en}`,
    margin,
    y,
  );
  y += 8;
  doc.setFont('OpenSans', 'normal').setFontSize(10);

  // Function to print a line with label and value
  const printLine = (
    key: keyof typeof translations.fields,
    value: string,
    extraHeight = 0,
  ): void => {
    const labelWidth = 80;
    const valueX = margin + labelWidth;
    const maxWidth = width - margin - valueX;

    // Ensure consistent font size
    doc.setFontSize(10);
    doc.text(
      `${translations.fields[key].pl} / ${translations.fields[key].en}:`,
      margin,
      y,
    );

    // Handle text wrapping for long values
    if (key === 'reason' || value.length > 40) {
      const valueLines = doc.splitTextToSize(value, maxWidth);
      valueLines.forEach((line: string, idx: number) => {
        doc.text(line, valueX, y + idx * 5);
      });

      const dynamicHeight = Math.max(0, (valueLines.length - 1) * 5);
      y += 6 + extraHeight + dynamicHeight;
    } else {
      doc.text(value, valueX, y);
      y += 6 + extraHeight;
    }
  };

  // Print all detail fields
  printLine('created', new Date(deviation.createdAt).toLocaleDateString(lang));
  printLine('owner', extractNameFromEmail(deviation.owner));
  printLine('article', deviation.articleName || '-');
  printLine('number', deviation.articleNumber || '-');
  printLine('customerNumber', deviation.customerNumber || '-');
  printLine('customerName', deviation.customerName || '-');
  printLine('workplace', deviation.workplace || '-');
  printLine('drawingNumber', deviation.drawingNumber || '-');
  printLine(
    'quantity',
    deviation.quantity
      ? `${deviation.quantity.value} ${deviation.quantity.unit === 'pcs' ? 'szt.' : deviation.quantity.unit}`
      : '-',
  );
  printLine('charge', deviation.charge || '-');
  printLine(
    'period',
    deviation.timePeriod?.from && deviation.timePeriod?.to
      ? `${new Date(deviation.timePeriod.from).toLocaleDateString(lang)} - ${new Date(deviation.timePeriod.to).toLocaleDateString(lang)}`
      : '-',
  );

  // Reason and area with proper handling
  const reasonOption = reasonOptions.find((o) => o.value === deviation.reason);
  printLine(
    'reason',
    reasonOption
      ? `${reasonOption.pl || reasonOption.label} / ${reasonOption.label}`
      : '-',
    2, // Extra height for reason row
  );

  const areaOption = areaOptions.find((o) => o.value === deviation.area);
  printLine(
    'area',
    areaOption
      ? areaOption.pl && areaOption.pl !== areaOption.label
        ? `${areaOption.pl} / ${areaOption.label}`
        : areaOption.label
      : '-',
  );

  // Customer authorization
  printLine(
    'customerAuth',
    deviation.customerAuthorization ? 'Tak / Yes' : 'Nie / No',
  );

  // Process spec
  printLine('specification', typedDeviation.processSpecification || '-');

  // Section: Description
  y += 6;
  doc.setFont('OpenSans', 'bold').setFontSize(12);
  doc.text(
    `${translations.sections.description.pl} / ${translations.sections.description.en}`,
    margin,
    y,
  );
  y += 8;
  doc.setFont('OpenSans', 'normal').setFontSize(10);
  const descLines = doc.splitTextToSize(
    deviation.description || '-',
    width - margin * 2,
  );
  descLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 6;
  });

  // Section: Approvals
  y += 6;
  checkForPageBreak();
  doc.setFont('OpenSans', 'bold').setFontSize(12);
  doc.text(
    `${translations.sections.approvals.pl} / ${translations.sections.approvals.en}`,
    margin,
    y,
  );
  y += 8;
  doc.setFont('OpenSans', 'normal').setFontSize(10);

  // Column widths for approvals table
  const colWidths = [90, 30, 30];
  let x = margin;

  // Approval table headers
  ['role', 'by', 'date'].forEach((field, i) => {
    const key = field as keyof typeof translations.approvals;
    // Ensure we're accessing a field with pl/en properties directly
    const translation = translations.approvals[key];
    if ('pl' in translation && 'en' in translation) {
      doc.text(`${translation.pl} / ${translation.en}`, x, y);
    }
    x += colWidths[i];
  });
  y += 6;

  // Position translations
  const positionTranslations: Record<string, string> = {
    'group-leader': 'Group Leader / Group Leader',
    'quality-manager': 'Kierownik Jakości / Quality Manager',
    'production-manager': 'Kierownik Produkcji / Production Manager',
    'plant-manager': 'Dyrektor Zakładu / Plant Manager',
  };

  // Approvals list
  const approvalsList = [
    {
      approval: typedDeviation.groupLeaderApproval,
      position: 'group-leader' as const,
    },
    {
      approval: typedDeviation.qualityManagerApproval,
      position: 'quality-manager' as const,
    },
    {
      approval: typedDeviation.productionManagerApproval,
      position: 'production-manager' as const,
    },
    {
      approval: typedDeviation.plantManagerApproval,
      position: 'plant-manager' as const,
    },
  ];

  // Print approvals
  approvalsList.forEach(({ approval, position }) => {
    x = margin;
    doc.text(positionTranslations[position], x, y);
    x += colWidths[0];
    doc.text(approval?.by ? extractNameFromEmail(approval.by) : '-', x, y);
    x += colWidths[1];
    doc.text(
      approval?.at ? new Date(approval.at).toLocaleDateString(lang) : '-',
      x,
      y,
    );
    y += 6;
  });

  // Section: Corrective Actions
  y += 6;
  checkForPageBreak();
  doc.setFont('OpenSans', 'bold').setFontSize(12);
  doc.text(
    `${translations.sections.actions.pl} / ${translations.sections.actions.en}`,
    margin,
    y,
  );
  y += 8;
  doc.setFont('OpenSans', 'normal').setFontSize(10);
  if (deviation.correctiveActions?.length) {
    deviation.correctiveActions.forEach((act, idx) => {
      checkForPageBreak(15);
      const lines = doc.splitTextToSize(
        `${idx + 1}. ${act.description}`,
        width - margin * 2,
      );
      lines.forEach((line: string) => {
        if (y > height - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 6;
      });
    });
  } else {
    doc.text('Brak działań korygujących / No corrective actions', margin, y);
    y += 6;
  }

  // Section: Attachments
  const attachments = deviation.attachments?.map((a) => a.name) || [];
  if (attachments.length) {
    y += 6;
    checkForPageBreak();
    doc.setFont('OpenSans', 'bold').setFontSize(12);
    doc.text(
      `${translations.sections.attachments.pl} / ${translations.sections.attachments.en}`,
      margin,
      y,
    );
    y += 8;
    doc.setFont('OpenSans', 'normal').setFontSize(10);
    attachments.forEach((name) => {
      checkForPageBreak();
      doc.text(`- ${name}`, margin, y);
      y += 6;
    });
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('OpenSans', 'italic').setFontSize(8);
    const footerText = `${translations.footer.generated.pl}: ${new Date().toLocaleString(lang)}, przez: ${generatedBy} / ${translations.footer.generated.en}: ${new Date().toLocaleString(lang)}, by: ${generatedBy}`;
    doc.text(footerText, margin, height - 10);
    doc.text(
      `Strona ${i} z ${pageCount} / Page ${i} of ${pageCount}`,
      width - margin,
      height - 10,
      { align: 'right' },
    );
  }

  return Buffer.from(await doc.output('arraybuffer'));
}

// API route handler
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviationId } = await request.json();
    if (!deviationId)
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const devCol = await dbc('deviations');
    const cfgCol = await dbc('deviations_config');

    const deviation = await devCol.findOne({ _id: new ObjectId(deviationId) });
    if (!deviation)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const rc = await cfgCol.findOne({ config: 'reason_options' });
    const ac = await cfgCol.findOne({ config: 'area_options' });

    const pdfBuffer = await generateDeviationPdf({
      deviation: deviation as unknown as DeviationType,
      reasonOptions: rc?.options || [],
      areaOptions: ac?.options || [],
      lang: 'pl',
      generatedBy: extractNameFromEmail(session.user.email),
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deviation-card-${deviationId}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Error generating PDF' },
      { status: 500 },
    );
  }
}
