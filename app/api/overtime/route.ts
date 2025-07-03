import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Get user roles
    const userRoles = session.user?.roles ?? [];
    const isManager = userRoles.some((role) =>
      role.toLowerCase().includes('manager'),
    );
    const isAdmin = userRoles.includes('admin');
    const isHR = userRoles.includes('hr');

    let submissions;

    if (isAdmin || isHR) {
      // Admins and HR can see all submissions
      submissions = await coll.find({}).toArray();
    } else if (isManager) {
      // Managers can see submissions they supervise and their own submissions
      submissions = await coll
        .find({
          $or: [
            { supervisor: session.user.email },
            { submittedBy: session.user.email },
          ],
        })
        .toArray();
    } else {
      // Regular employees can only see their own submissions
      submissions = await coll
        .find({ submittedBy: session.user.email })
        .toArray();
    }

    // Transform submissions to include display names
    const transformedSubmissions = submissions.map((submission) => ({
      ...submission,
      _id: submission._id.toString(),
      submittedByName: extractNameFromEmail(submission.submittedBy),
      supervisorName: extractNameFromEmail(submission.supervisor),
    }));

    return Response.json(transformedSubmissions);
  } catch (error) {
    console.error('Error fetching overtime submissions:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
