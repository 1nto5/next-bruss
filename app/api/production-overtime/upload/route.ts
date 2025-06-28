import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
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

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
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

    // Create base directory if it doesn't exist
    const baseFolder = path.join(BASE_PATH, 'production_overtime');
    fs.mkdirSync(baseFolder, { recursive: true });

    // Get file extension
    const fileExt = path.extname(file.name);

    // Create filename with order ID - this ensures uniqueness
    const fileName = `${overTimeRequestId}${fileExt}`;
    const filePath = path.join(baseFolder, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File already exists' },
        { status: 409 },
      );
    }

    // Save file to disk
    fs.writeFileSync(filePath, buf);

    // Database update - now using a boolean flag instead of an array
    try {
      if (order.status !== 'approved') {
        console.error('Order has incorrect status:', order.status);
        return NextResponse.json(
          { error: 'Order must be in approved status to add attachments' },
          { status: 400 },
        );
      }

      // Update document with simplified properties
      const updateResult = await collection.updateOne(
        { _id: objectId },
        {
          $set: {
            hasAttachment: true,
            attachmentFilename: fileName,
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
          { error: 'Failed to update overTimeRequest with attachment' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message:
          'Attendance list added successfully and order marked as completed',
        filename: fileName,
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
