import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

const BASE_PATH = process.env.UPLOAD_BASE_PATH || './public';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB total limit

// Allowed file types
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  // Excel
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  // PowerPoint
  'application/vnd.ms-powerpoint', // ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  // Text files
  'text/plain',
  'text/csv',
  // Zip archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Convert image to PDF page
async function convertImageToPdf(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  let image;
  if (mimeType === 'image/png') {
    image = await pdfDoc.embedPng(imageBuffer);
  } else if (mimeType === 'image/jpeg') {
    image = await pdfDoc.embedJpg(imageBuffer);
  } else {
    // Convert other formats to PNG using sharp, then embed
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    image = await pdfDoc.embedPng(pngBuffer);
  }

  // Create a page with appropriate dimensions
  const { width, height } = image;
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width,
    height,
  });

  return Buffer.from(await pdfDoc.save());
}

// Merge multiple PDFs into one
async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

export async function POST(req: NextRequest) {
  try {
    // User authorization
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const form = await req.formData();
    const files = form.getAll('files') as File[];
    const overTimeRequestId = form.get('overTimeRequestId') as string | null;
    const mergeFiles = form.get('mergeFiles') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files' }, { status: 400 });
    }

    if (!overTimeRequestId) {
      return NextResponse.json(
        { error: 'No overTimeRequest ID' },
        { status: 400 },
      );
    }

    // Get the overtime request to check permissions
    const collection = await dbc('production_overtime');
    let objectId;
    try {
      objectId = new ObjectId(overTimeRequestId);
    } catch (error) {
      console.error('Error converting to ObjectId:', error);
      return NextResponse.json(
        { error: 'Invalid ObjectId format' },
        { status: 400 },
      );
    }

    const order = await collection.findOne({ _id: objectId });
    if (!order) {
      console.error('Order not found with ObjectId:', objectId.toString());
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check user permissions (same logic as in AddAttachmentDialog)
    const userRoles = session.user?.roles || [];
    const userEmail = session.user?.email;
    const ATTACHMENT_ROLES = [
      'admin',
      'group-leader',
      'production-manager',
      'plant-manager',
      'hr',
    ];

    const canAddAttachment =
      userRoles.some((role) => ATTACHMENT_ROLES.includes(role)) ||
      userEmail === order.requestedBy ||
      userEmail === order.responsibleEmployee;

    if (!canAddAttachment) {
      return NextResponse.json(
        { error: 'Insufficient permissions to add attachment' },
        { status: 403 },
      );
    }

    // Validate files
    let totalSize = 0;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds the limit (10MB)` },
          { status: 400 },
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${file.type} for file ${file.name}`,
            allowedTypes: ALLOWED_FILE_TYPES.join(', '),
          },
          { status: 400 },
        );
      }

      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: 'Total file size exceeds the limit (50MB)' },
        { status: 400 },
      );
    }

    // Create base directory if it doesn't exist
    const baseFolder = path.join(BASE_PATH, 'production_overtime');
    fs.mkdirSync(baseFolder, { recursive: true });

    const filesToMerge: Buffer[] = [];

    // Process each file for merging only (don't save individual files)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Prepare files for PDF conversion/merging
      try {
        if (file.type === 'application/pdf') {
          // Add PDF as-is
          filesToMerge.push(fileBuffer);
        } else if (IMAGE_TYPES.includes(file.type)) {
          // Convert image to PDF
          const pdfBuffer = await convertImageToPdf(fileBuffer, file.type);
          filesToMerge.push(pdfBuffer);
        } else {
          // For other file types, we can't merge them into PDF
          console.warn(
            `Cannot merge file type ${file.type} into PDF: ${file.name}`,
          );
        }
      } catch (error) {
        console.error(`Error processing file ${file.name} for merging:`, error);
        // Continue with other files, but don't include this one in merge
      }
    }

    // Create merged PDF (this is now the main output)
    let mergedFilename: string | null = null;
    if (filesToMerge.length > 0) {
      try {
        const mergedPdfBuffer = await mergePdfs(filesToMerge);
        const fileName = `lista_obecnosci_${overTimeRequestId}.pdf`;
        const filePath = path.join(baseFolder, fileName);

        fs.writeFileSync(filePath, mergedPdfBuffer);
        mergedFilename = fileName;
      } catch (error) {
        console.error('Error merging files:', error);
        return NextResponse.json(
          { error: 'Failed to merge files into PDF' },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No files could be processed for PDF creation' },
        { status: 400 },
      );
    }

    // Database update
    try {
      if (order.status !== 'approved') {
        console.error('Order has incorrect status:', order.status);
        return NextResponse.json(
          { error: 'Order must be in approved status to add attachments' },
          { status: 400 },
        );
      }

      // Update document with original attachment structure
      const updateResult = await collection.updateOne(
        { _id: objectId },
        {
          $set: {
            hasAttachment: true,
            attachmentFilename: mergedFilename,
            status: 'completed',
            completedAt: new Date(),
            completedBy: session.user.email,
            editedAt: new Date(),
            editedBy: session.user.email,
          },
        },
      );

      if (updateResult.matchedCount === 0) {
        console.error('No matching document found for update');
        return NextResponse.json(
          { error: 'Order not found for update' },
          { status: 404 },
        );
      }

      if (updateResult.modifiedCount === 0) {
        console.error('Document matched but not modified');
        return NextResponse.json(
          { error: 'Failed to update overTimeRequest with attachments' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message:
          'Pliki zostały scalone w PDF i przesłane pomyślnie! Status zlecenia zmieniony na ukończony.',
        mergedFile: {
          filename: mergedFilename,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Database update failed',
          details: (dbError as Error).message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: (error as Error).message },
      { status: 500 },
    );
  }
}
