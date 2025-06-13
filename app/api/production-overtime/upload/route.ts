import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import fs from 'fs';
import { ObjectId } from 'mongodb';
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
    // User authorization
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const overTimeRequestId = form.get('overTimeRequestId') as string | null;
    const name = form.get('name') as string | null;
    const note = form.get('note') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    if (!overTimeRequestId) {
      return NextResponse.json(
        { error: 'No overTimeRequest ID' },
        { status: 400 },
      );
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

    // File processing
    const buf = Buffer.from(await file.arrayBuffer());

    // Create folder for overtime request
    const overTimeRequestFolder = path.join(
      BASE_PATH,
      'production_overtime', // Changed from 'production-overtime' to 'production_overtime'
      overTimeRequestId,
    );
    fs.mkdirSync(overTimeRequestFolder, { recursive: true });

    // Generate file name
    const fileName = `${file.name}`;
    const filePath = path.join(overTimeRequestFolder, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File already exists' },
        { status: 409 },
      );
    }

    // Save file to disk
    fs.writeFileSync(filePath, buf);

    // Prepare attachment data for database
    const attachment = {
      filename: fileName,
      name: name,
      note: note || undefined,
      uploadedBy: session.user.email,
      uploadedAt: new Date(),
      size: file.size,
      type: file.type,
    };

    // Database update - now also changes status to 'closed'
    try {
      const collection = await dbc('production_overtime');

      // Convert the string ID to ObjectId
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

      // Find the document using ObjectId
      const order = await collection.findOne({ _id: objectId });

      if (!order) {
        console.error('Order not found with ObjectId:', objectId.toString());
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'approved') {
        console.error('Order has incorrect status:', order.status);
        return NextResponse.json(
          { error: 'Order must be in approved status to add attachments' },
          { status: 400 },
        );
      }

      // Use ObjectId for the update operation
      const updateResult = await collection.updateOne(
        { _id: objectId },
        {
          $push: {
            attachments: attachment,
          },
          $set: {
            status: 'closed',
            closedAt: new Date(),
            closedBy: session.user.email,
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
          { error: 'Failed to update overTimeRequest with attachment' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message:
          'Attendance list added successfully and order marked as closed',
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
