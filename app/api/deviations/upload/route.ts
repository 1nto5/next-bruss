import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

const BASE_PATH = process.env.UPLOAD_BASE_PATH || './public';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

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

export async function POST(req: NextRequest) {
  try {
    // Autoryzacja użytkownika
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pobierz dane z formularza
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const deviationId = form.get('deviationId') as string | null;
    const name = form.get('name') as string | null;
    const note = form.get('note') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    if (!deviationId) {
      return NextResponse.json({ error: 'No deviation ID' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the limit (10MB)' },
        { status: 400 },
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Unsupported file type',
          allowedTypes: ALLOWED_FILE_TYPES.join(', '),
          receivedType: file.type,
        },
        { status: 400 },
      );
    }

    // Przetwarzanie pliku
    const buf = Buffer.from(await file.arrayBuffer());

    // Utworzenie folderu dla odchylenia
    const deviationFolder = path.join(BASE_PATH, 'deviations', deviationId);
    fs.mkdirSync(deviationFolder, { recursive: true });

    // Generowanie nazwy pliku
    const fileName = `${file.name}`;
    const filePath = path.join(deviationFolder, fileName);

    // Sprawdzenie, czy plik już istnieje
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File already exists' },
        { status: 409 },
      );
    }

    // Zapis pliku na dysku
    fs.writeFileSync(filePath, buf);

    // Przygotowanie danych załącznika do zapisu w bazie danych
    const attachment = {
      filename: fileName,
      name: name,
      note: note || undefined,
      uploadedBy: session.user.email,
      uploadedAt: new Date(),
      size: file.size,
      type: file.type,
    };

    // Aktualizacja bazy danych
    try {
      const collection = await dbc('deviations');
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(deviationId) },
        {
          $push: {
            attachments: attachment,
          },
        },
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to update deviation with attachment' },
          { status: 500 },
        );
      }

      // Odświeżenie cache'u
      revalidateTag('deviation');

      return NextResponse.json({
        success: true,
        message: 'Attachment added successfully',
        attachment,
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
