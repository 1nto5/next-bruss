import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { formatDate, formatDateTime } from '@/lib/utils/date-format';
import { Clock, FileText, Table as TableIcon, X } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';
import { redirect } from 'next/navigation';
import { getDictionary } from '../../lib/dict';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import type { Dictionary } from '../../lib/dict';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string, dict: Dictionary) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='statusPending' size='lg' className='text-lg'>
          {dict.detailsPage.statusLabels.pending}
        </Badge>
      );
    case 'pending-plant-manager':
      return (
        <Badge
          variant='statusPending'
          size='lg'
          className='bg-yellow-400 text-lg text-black'
        >
          {dict.detailsPage.statusLabels.pendingPlantManager}
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant='statusApproved' size='lg' className='text-lg'>
          {dict.detailsPage.statusLabels.approved}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant='statusRejected' size='lg' className='text-lg'>
          {dict.detailsPage.statusLabels.rejected}
        </Badge>
      );
    case 'accounted':
      return (
        <Badge variant='statusAccounted' size='lg' className='text-lg'>
          {dict.detailsPage.statusLabels.accounted}
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant='statusCancelled' size='lg' className='text-lg'>
          {dict.detailsPage.statusLabels.cancelled}
        </Badge>
      );
    default:
      return (
        <Badge variant='outline' size='lg' className='text-lg'>
          {status}
        </Badge>
      );
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const submission = await getOvertimeSubmission(id);

  if (!submission) {
    return {
      title: `${dict.detailsPage.title} (BRUSS)`,
    };
  }

  return {
    title: `${dict.detailsPage.title} - ${submission.internalId || id} (BRUSS)`,
  };
}

async function getOvertimeSubmission(id: string) {
  try {
    const coll = await dbc('overtime_submissions');
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    return submission;
  } catch (error) {
    console.error('Error fetching overtime submission:', error);
    return null;
  }
}

export default async function OvertimeSubmissionDetailsPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { lang, id } = params;
  const { from } = searchParams;

  const dict = await getDictionary(lang);

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=${encodeURIComponent(`/overtime-submissions/${id}`)}`);
  }

  const submission = await getOvertimeSubmission(id);

  if (!submission) {
    redirect(`/${lang}/overtime-submissions`);
  }

  // Determine the back URL based on where the user came from
  const backUrl = from === 'hr-view'
    ? '/overtime-submissions/hr-view'
    : '/overtime-submissions';

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='mb-2 sm:mb-0'>
            {getStatusBadge(submission.status, dict)}
          </CardTitle>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {/* Back to submissions button */}
            <LocalizedLink
              href={backUrl}
              className='w-full sm:w-auto'
            >
              <Button variant='outline' className='w-full'>
                <TableIcon /> {dict.detailsPage.backToSubmissions}
              </Button>
            </LocalizedLink>
          </div>
        </div>
        {submission.internalId && (
          <CardDescription>ID: {submission.internalId}</CardDescription>
        )}
      </CardHeader>
      <Separator className='mb-4' />

      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-x-4 lg:space-y-0'>
            {/* Left Column - Submission Details */}
            <Card className='lg:w-5/12'>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FileText className='mr-2 h-5 w-5' />{' '}
                  {dict.detailsPage.submissionDetails}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-medium'>
                        {dict.detailsPage.submittedBy}
                      </TableCell>
                      <TableCell>
                        {extractNameFromEmail(submission.submittedBy)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        {dict.detailsPage.supervisor}
                      </TableCell>
                      <TableCell>
                        {extractNameFromEmail(submission.supervisor)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        {dict.detailsPage.date}
                      </TableCell>
                      <TableCell>{formatDate(submission.date)}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        {dict.detailsPage.hours}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            submission.hours < 0
                              ? 'text-red-600 dark:text-red-400'
                              : ''
                          }
                        >
                          {submission.hours}h
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Only show these fields for positive hours (adding overtime, not picking up) */}
                    {submission.hours >= 0 && (
                      <>
                        <TableRow>
                          <TableCell className='font-medium'>
                            {dict.detailsPage.overtimeRequest}
                          </TableCell>
                          <TableCell>
                            {submission.overtimeRequest
                              ? dict.detailsPage.yes
                              : dict.detailsPage.no}
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='font-medium'>
                            {dict.detailsPage.payment}
                          </TableCell>
                          <TableCell>
                            {submission.payment
                              ? dict.detailsPage.yes
                              : dict.detailsPage.no}
                          </TableCell>
                        </TableRow>

                        {submission.scheduledDayOff && (
                          <TableRow>
                            <TableCell className='font-medium'>
                              {dict.detailsPage.scheduledDayOff}
                            </TableCell>
                            <TableCell>
                              {formatDate(submission.scheduledDayOff)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}

                    {/* Show reason if it exists (for both positive and negative hours) */}
                    {submission.reason && (
                      <TableRow>
                        <TableCell className='font-medium align-top'>
                          {dict.detailsPage.reason}
                        </TableCell>
                        <TableCell className='whitespace-pre-wrap'>
                          {submission.reason}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Right Column - History */}
            <div className='flex-col space-y-4 lg:w-7/12'>
              {/* Status History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Clock className='mr-2 h-5 w-5' /> {dict.detailsPage.history}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{dict.detailsPage.statusColumn}</TableHead>
                        <TableHead>{dict.detailsPage.person}</TableHead>
                        <TableHead>{dict.detailsPage.dateTime}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Cancelled */}
                      {submission.cancelledAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusCancelled'>
                              {dict.detailsPage.statusLabels.cancelled}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(submission.cancelledBy || '')}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.cancelledAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Accounted */}
                      {submission.accountedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusAccounted'>
                              {dict.detailsPage.statusLabels.accounted}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(submission.accountedBy || '')}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.accountedAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Plant Manager Approved */}
                      {submission.plantManagerApprovedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusApproved'>
                              {dict.detailsPage.statusLabels.plantManagerApproved}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(
                              submission.plantManagerApprovedBy || '',
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.plantManagerApprovedAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Supervisor Approved */}
                      {submission.supervisorApprovedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusApproved'>
                              {dict.detailsPage.statusLabels.supervisorApproved}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(
                              submission.supervisorApprovedBy || '',
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.supervisorApprovedAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Approved (final) */}
                      {submission.approvedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusApproved'>
                              {dict.detailsPage.statusLabels.approved}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(submission.approvedBy || '')}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.approvedAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Rejected */}
                      {submission.rejectedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusRejected'>
                              {dict.detailsPage.statusLabels.rejected}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(submission.rejectedBy || '')}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(submission.rejectedAt)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Edited */}
                      {submission.editedAt &&
                        submission.editedAt.getTime() !==
                          submission.submittedAt.getTime() && (
                          <TableRow>
                            <TableCell>
                              <Badge variant='outline'>
                                {dict.detailsPage.statusLabels.edited}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {extractNameFromEmail(submission.editedBy || '')}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(submission.editedAt)}
                            </TableCell>
                          </TableRow>
                        )}

                      {/* Created */}
                      <TableRow>
                        <TableCell>
                          <Badge variant='outline'>
                            {dict.detailsPage.statusLabels.created}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {extractNameFromEmail(submission.submittedBy)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(submission.submittedAt)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Rejection Details Card */}
              {submission.rejectionReason && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center text-destructive'>
                      <X className='mr-2 h-5 w-5' />{' '}
                      {dict.detailsPage.rejectionDetails}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className='font-medium'>
                            {dict.detailsPage.rejectionReason}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className='max-w-[400px] break-words text-justify'>
                            {submission.rejectionReason}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
