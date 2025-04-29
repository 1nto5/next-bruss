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

interface GenerateDeviationPdfOptions {
  deviation: DeviationType;
  reasonOptions: DeviationReasonType[];
  areaOptions: DeviationAreaType[];
  lang: string;
  generatedBy?: string;
}

// Translation structure
const translations = {
  title: {
    pl: 'Odchylenie w procesie produkcyjnym',
    en: 'Deviation request in the production process',
  },
  sections: {
    details: { pl: 'Szczegóły', en: 'Details' },
    description: { pl: 'Opis', en: 'Description' },
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
    customerName: { pl: 'Nazwa klienta', en: 'Customer Name' },
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

// Helper function for font loading (single family path)
function loadFonts(doc: jsPDF): void {
  try {
    const toBase64 = (file: string) =>
      fs
        .readFileSync(path.join(process.cwd(), 'public/fonts', file))
        .toString('base64');

    doc.addFileToVFS('OpenSans-Regular.ttf', toBase64('OpenSans-Regular.ttf'));
    doc.addFileToVFS('OpenSans-Bold.ttf', toBase64('OpenSans-Bold.ttf'));
    doc.addFileToVFS('OpenSans-Italic.ttf', toBase64('OpenSans-Italic.ttf'));
    doc.addFileToVFS(
      'OpenSans-SemiBoldItalic.ttf',
      toBase64('OpenSans-SemiBoldItalic.ttf'),
    );

    doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
    doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
    doc.addFont('OpenSans-Italic.ttf', 'OpenSans', 'italic');
    doc.addFont('OpenSans-SemiBoldItalic.ttf', 'OpenSans', 'bolditalic');

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

  loadFonts(doc);
  let y = margin;
  const checkForPageBreak = (neededSpace = 30): boolean => {
    if (y + neededSpace > height - 20) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header: logo, title, QR code...
  // ... (bez zmian)

  // Section: Corrective Actions
  y += 6;
  checkForPageBreak();
  doc.setFont('OpenSans', 'bold').setFontSize(12);
  doc.text(translations.sections.actions.pl, margin, y);
  const actionsEnW = doc.getTextWidth(translations.sections.actions.pl);
  doc.setFont('OpenSans', 'bolditalic');
  doc.text(` / ${translations.sections.actions.en}`, margin + actionsEnW, y);
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
    // Separate Polish and English with proper styles
    const noPl = 'Brak działań korygujących';
    doc.setFont('OpenSans', 'normal');
    doc.text(noPl, margin, y);
    const plW = doc.getTextWidth(noPl);
    doc.setFont('OpenSans', 'italic');
    doc.text(` / No corrective actions`, margin + plW, y);
    doc.setFont('OpenSans', 'normal');
    y += 6;
  }

  // Attachments, Footer etc... (bez zmian)

  return Buffer.from(await doc.output('arraybuffer'));
}

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
      deviation: deviation as DeviationType,
      reasonOptions: rc?.options || [],
      areaOptions: ac?.options || [],
      lang: 'pl',
      generatedBy: extractNameFromEmail(session.user.email),
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deviation-${deviationId}.pdf"`,
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
