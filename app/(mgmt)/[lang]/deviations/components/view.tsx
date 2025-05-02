'use client';

import { Button } from '@/components/ui/button';

import {
  DeviationAreaType,
  DeviationReasonType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import {
  CheckCheck, // Import CheckCheck
  Cog,
  FileDown,
  Hammer,
  History, // Import History icon
  LayoutList, // Import LayoutList
  MailCheck,
  Paperclip, // Import Paperclip
  Printer,
  Table as TableIcon,
  Wrench, // Import Wrench
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState, useTransition } from 'react'; // Import useState
import { toast } from 'sonner';
import { approveDeviation } from '../actions';
import AddAttachmentDialog from './add-attachment-dialog';
import EditLogDialog from './edit-log-dialog'; // RENAMED & UNCOMMENTED: Import the dialog component
import TableCellsApprove from './table-cell-approve-role';
import TableCellCorrectiveAction from './table-cell-corrective-action';

// Lista dozwolonych ról do zatwierdzania odchyleń
const APPROVAL_ROLES = [
  'group-leader',
  'quality-manager',
  'production-manager',
  'plant-manager',
] as const;

// NEW: Lista dozwolonych ról do dodawania załączników
const ATTACHMENT_ROLES = [
  'quality',
  'team-leader',
  'group-leader',
  'quality-manager',
  'production-manager',
  'plant-manager',
] as const;

type ApprovalRole = (typeof APPROVAL_ROLES)[number];

export default function DeviationView({
  deviation,
  lang,
  session,
  fetchTime,
  reasonOptions,
  areaOptions,
}: {
  deviation: DeviationType | null;
  lang: string;
  session: Session | null;
  fetchTime: Date;
  reasonOptions: DeviationReasonType[];
  areaOptions: DeviationAreaType[];
}) {
  const [isPendingApproval, startApprovalTransition] = useTransition();
  const [isPendingPdfExport, startPdfExportTransition] = useTransition();
  const [isEditLogDialogOpen, setIsEditLogDialogOpen] = useState(false); // RENAMED: State for dialog

  // Pobieranie wszystkich ról użytkownika, które są uprawnione do zatwierdzania
  const deviationUserRoles =
    session?.user?.roles?.filter((role) =>
      APPROVAL_ROLES.includes(role as ApprovalRole),
    ) || [];

  const handleApproval = async (
    approvalRole: string,
    isApproved: boolean = true,
    reason?: string,
  ) => {
    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        startApprovalTransition(async () => {
          try {
            if (!deviation?._id) {
              reject(new Error('Skontaktuj się z IT!'));
              return;
            }

            // Check if user has direct role or elevated permission
            const canApproveAsRole = hasElevatedPermission(
              session?.user?.roles || [],
              approvalRole,
            );

            if (deviation?._id && canApproveAsRole) {
              const res = await approveDeviation(
                deviation._id.toString(),
                approvalRole,
                isApproved,
                reason,
              );
              if (res.success) {
                resolve();
              } else if (res.error) {
                reject(new Error('Skontaktuj się z IT!'));
              }
            } else {
              reject(
                new Error(
                  'Nie posiadasz uprawnień do zatwierdzenia w tej roli!',
                ),
              );
            }
          } catch (error) {
            reject(new Error('Skontaktuj się z IT!'));
          }
        });
      }),
      {
        loading: isApproved
          ? 'Zatwierdzanie odchylenia...'
          : 'Odrzucanie odchylenia...',
        success: isApproved ? 'Zatwierdzono!' : 'Odrzucono!',
        error: (err) => err.message,
      },
    );
  };

  // Function to check if a user has permission to approve as a specific role
  const hasElevatedPermission = (
    userRoles: string[],
    targetRole: string,
  ): boolean => {
    // Direct role check
    if (userRoles.includes(targetRole)) {
      return true;
    }

    // Elevation check
    if (
      userRoles.includes('plant-manager') &&
      [
        'group-leader',
        'quality-manager',
        'production-manager',
        'plant-manager',
      ].includes(targetRole)
    ) {
      return true;
    }

    if (
      userRoles.includes('production-manager') &&
      targetRole === 'group-leader'
    ) {
      return true;
    }

    return false;
  };

  const handleExportToPdf = () => {
    if (!deviation?._id) {
      toast.error('Nie można wyeksportować PDF - brak ID odchylenia');
      return;
    }

    toast.promise(
      new Promise<void>((resolve, reject) => {
        startPdfExportTransition(async () => {
          try {
            const response = await fetch(
              '/api/deviations/deviation/pdf-export',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  deviationId: deviation?._id?.toString(),
                }),
              },
            );

            if (!response.ok) {
              throw new Error('Błąd podczas generowania PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deviation-${deviation?._id?.toString() || 'unknown'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            resolve();
          } catch (error) {
            console.error('Error generating PDF:', error);
            reject(new Error('Błąd podczas generowania PDF'));
          }
        });
      }),
      {
        loading: 'Generowanie PDF...',
        success: 'PDF wygenerowano pomyślnie!',
        error: (err) => err.message,
      },
    );
  };

  // Check if deviation can be printed (only approved, active or closed)
  const canPrint =
    (deviation?.status === 'approved' ||
      deviation?.status === 'in progress' ||
      deviation?.status === 'closed') &&
    (session?.user?.roles?.some((role) =>
      [
        'team-leader',
        'group-leader',
        'quality-manager',
        'production-manager',
        'plant-manager',
      ].includes(role),
    ) ||
      session?.user?.email === deviation?.owner);

  // NEW: Check if user can add attachments
  const canAddAttachment =
    deviation?.status !== 'closed' &&
    (session?.user?.roles?.some((role) =>
      ATTACHMENT_ROLES.includes(role as (typeof ATTACHMENT_ROLES)[number]),
    ) ||
      session?.user?.email === deviation?.owner);

  const statusCardTitle = () => {
    switch (deviation?.status) {
      case 'approved':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-lg text-green-800 hover:bg-green-100'
          >
            Odchylenie zatwierdzone
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-lg text-red-800 hover:bg-red-100'
          >
            Odchylenie odrzucone
          </Badge>
        );
      case 'in approval':
        return (
          <Badge variant='outline' className='text-lg text-nowrap'>
            Odchylenie w trakcie zatwierdzania
          </Badge>
        );
      case 'in progress':
        return (
          <Badge
            variant='default'
            className='bg-blue-100 text-lg text-blue-800 hover:bg-blue-100'
          >
            Odchylenie obowiązuje
          </Badge>
        );
      case 'closed':
        return (
          <Badge
            variant='default'
            className='bg-gray-100 text-lg text-gray-800 hover:bg-gray-100'
          >
            Odchylenie zamknięte
          </Badge>
        );
      default:
        return 'Odchylenie';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          {' '}
          {/* Stack vertically on small, row on sm+ */}
          <CardTitle className='mb-2 sm:mb-0'>
            {statusCardTitle()}
          </CardTitle>{' '}
          {/* Margin bottom only on small screens */}
          <div className='flex flex-wrap justify-start space-x-2 sm:justify-end'>
            {' '}
            {/* Button container */}
            {/* Show PDF export button only for approved, active or closed deviations */}
            {canPrint && (
              <Button
                variant='outline'
                onClick={handleExportToPdf}
                disabled={isPendingPdfExport}
                className='mb-2 sm:mb-0' // Add margin bottom for stacking/wrapping on small screens
              >
                <Printer /> Drukuj
              </Button>
            )}
            <Link href='/deviations'>
              <Button variant='outline' className='mb-2 sm:mb-0'>
                {' '}
                {/* Add margin bottom */}
                <TableIcon /> Odchylenia
              </Button>
            </Link>
            {/* Add Edit Link for eligible deviations */}
            {['in approval', 'rejected'].includes(deviation?.status || '') &&
              (session?.user?.email === deviation?.owner ||
                session?.user?.roles?.includes('admin')) && ( // Check owner or admin
                <Link href={`/deviations/${deviation?._id}/edit`}>
                  <Button variant='outline' className='mb-2 sm:mb-0'>
                    {' '}
                    {/* Add margin bottom */}
                    <Cog />
                    Edytuj
                  </Button>
                </Link>
              )}
          </div>
        </div>
        <CardDescription>ID: {deviation?.internalId}</CardDescription>
      </CardHeader>
      <Separator className='mb-4' />
      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-y-0 lg:space-x-4'>
            <Card className='lg:w-2/5'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  {' '}
                  {/* Added justify-between */}
                  <CardTitle className='flex items-center'>
                    <LayoutList className='mr-2 h-5 w-5' /> Szczegóły
                  </CardTitle>
                  {/* Add History Button */}
                  {deviation?.editLogs &&
                    deviation.editLogs.length > 0 && ( // RENAMED: Check editLogs
                      <Button
                        variant='outline'
                        onClick={() => setIsEditLogDialogOpen(true)} // RENAMED: Setter
                      >
                        <History /> Historia
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-medium'>Utworzono:</TableCell>
                      <TableCell>
                        {deviation?.createdAt
                          ? new Date(deviation.createdAt).toLocaleString(lang)
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Właściciel:</TableCell>
                      <TableCell>
                        {extractNameFromEmail(deviation?.owner || '') || '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Numer artykułu.:
                      </TableCell>
                      <TableCell>{deviation?.articleNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Nazwa artykułu.:
                      </TableCell>
                      <TableCell>{deviation?.articleName || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Numer części klienta:
                      </TableCell>
                      <TableCell>{deviation?.customerNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Nazwa klienta:
                      </TableCell>
                      <TableCell>{deviation?.customerName || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Stanowisko:</TableCell>
                      <TableCell>{deviation?.workplace || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Ilość:</TableCell>
                      <TableCell>
                        {`${deviation?.quantity?.value || '-'} ${deviation?.quantity?.unit === 'pcs' ? 'szt.' : deviation?.quantity?.unit || ''}`}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Partia:</TableCell>
                      <TableCell>{deviation?.charge || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Powód:</TableCell>
                      <TableCell>
                        {deviation?.reason
                          ? reasonOptions.find(
                              (option) => option.value === deviation.reason,
                            )
                            ? lang === 'pl'
                              ? reasonOptions.find(
                                  (option) => option.value === deviation.reason,
                                )?.pl
                              : reasonOptions.find(
                                  (option) => option.value === deviation.reason,
                                )?.label
                            : deviation.reason
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Obowiązuje:</TableCell>
                      <TableCell>
                        {deviation?.timePeriod?.from &&
                        deviation?.timePeriod?.to
                          ? `${new Date(deviation?.timePeriod?.from).toLocaleDateString(lang)} - ${new Date(deviation?.timePeriod?.to).toLocaleDateString(lang)}`
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Obszar:</TableCell>
                      <TableCell>
                        {deviation?.area
                          ? areaOptions.find(
                              (option) => option.value === deviation.area,
                            )
                            ? lang === 'pl'
                              ? areaOptions.find(
                                  (option) => option.value === deviation.area,
                                )?.pl
                              : areaOptions.find(
                                  (option) => option.value === deviation.area,
                                )?.label
                            : deviation.area
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Opis:</TableCell>
                      <TableCell>{deviation?.description || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Specyfikacja procesu:</TableCell>
                      <TableCell>
                        {deviation?.processSpecification || '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Autoryzacja klienta:</TableCell>
                      <TableCell>
                        {deviation?.customerAuthorization ? 'Tak' : 'Nie'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className='flex-col space-y-4 lg:w-3/5'>
              <Card>
                <CardHeader>
                  <div className='flex justify-between'>
                    <CardTitle className='flex items-center'>
                      <Wrench className='mr-2 h-5 w-5' /> Akcje korygujące
                    </CardTitle>
                    {(session?.user?.roles?.some((role) =>
                      [
                        'quality',
                        'team-leader',
                        'group-leader',
                        'quality-manager',
                        'production-manager',
                        'plant-manager',
                      ].includes(role),
                    ) ||
                      session?.user?.email === deviation?.owner) && (
                      <Link
                        href={`/deviations/${deviation?._id}/corrective/add`}
                      >
                        <Button variant='outline'>
                          <Hammer /> Dodaj
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Zmiana statusu</TableHead>
                        <TableHead className='min-w-[250px]'>Opis</TableHead>
                        <TableHead>Wykonawca</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Ostatnia zmiana</TableHead>
                        <TableHead>Historia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deviation?.correctiveActions?.map(
                        (correctiveAction, index) => (
                          <TableRow key={index}>
                            <TableCellCorrectiveAction
                              correctiveAction={correctiveAction}
                              correctiveActionIndex={index}
                              deviationId={deviation?._id?.toString() || ''}
                              lang={lang}
                              user={session?.user?.email}
                              userRoles={session?.user?.roles}
                              deviationOwner={deviation?.owner}
                            />
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <CheckCheck className='mr-2 h-5 w-5' /> Zatwierdzenia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Stanowisko</TableHead>
                        <TableHead>Zatwierdzam</TableHead>
                        <TableHead>Osoba</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Komentarz</TableHead>
                        <TableHead>Historia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Group Leader'
                          deviationUserRoles={deviationUserRoles}
                          role='group-leader'
                          approved={deviation?.groupLeaderApproval?.approved}
                          handleApproval={(isApproved, reason) =>
                            handleApproval('group-leader', isApproved, reason)
                          }
                          by={deviation?.groupLeaderApproval?.by}
                          at={deviation?.groupLeaderApproval?.at?.toString()}
                          lang={lang}
                          reason={deviation?.groupLeaderApproval?.reason}
                          history={deviation?.groupLeaderApproval?.history}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Jakości'
                          deviationUserRoles={deviationUserRoles}
                          role='quality-manager'
                          approved={deviation?.qualityManagerApproval?.approved}
                          handleApproval={(isApproved, reason) =>
                            handleApproval(
                              'quality-manager',
                              isApproved,
                              reason,
                            )
                          }
                          by={deviation?.qualityManagerApproval?.by}
                          at={deviation?.qualityManagerApproval?.at?.toString()}
                          lang={lang}
                          reason={deviation?.qualityManagerApproval?.reason}
                          history={deviation?.qualityManagerApproval?.history}
                        />
                      </TableRow>

                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Produkcji'
                          deviationUserRoles={deviationUserRoles}
                          role='production-manager'
                          approved={
                            deviation?.productionManagerApproval?.approved
                          }
                          handleApproval={(isApproved, reason) =>
                            handleApproval(
                              'production-manager',
                              isApproved,
                              reason,
                            )
                          }
                          by={deviation?.productionManagerApproval?.by}
                          at={deviation?.productionManagerApproval?.at?.toString()}
                          lang={lang}
                          reason={deviation?.productionManagerApproval?.reason}
                          history={
                            deviation?.productionManagerApproval?.history
                          }
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Dyrektor Zakładu'
                          deviationUserRoles={deviationUserRoles}
                          role='plant-manager'
                          approved={deviation?.plantManagerApproval?.approved}
                          handleApproval={(isApproved, reason) =>
                            handleApproval('plant-manager', isApproved, reason)
                          }
                          by={deviation?.plantManagerApproval?.by}
                          at={deviation?.plantManagerApproval?.at?.toString()}
                          lang={lang}
                          reason={deviation?.plantManagerApproval?.reason}
                          history={deviation?.plantManagerApproval?.history}
                        />
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <MailCheck className='mr-2 h-5 w-5' /> Wysłane powiadomienia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className='h-60'>
                    {' '}
                    {/* Add ScrollArea with height */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Do</TableHead>
                          <TableHead>Data wysłania</TableHead>
                          <TableHead>Typ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deviation?.notificationLogs &&
                        deviation.notificationLogs.length > 0 ? (
                          [...deviation.notificationLogs] // Create a shallow copy to avoid mutating the original array
                            .sort(
                              (a, b) =>
                                new Date(b.sentAt).getTime() -
                                new Date(a.sentAt).getTime(),
                            ) // Sort by date descending
                            // .slice(0, 10) // Remove slice to show all logs
                            .map((log, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {extractNameFromEmail(log.to)}
                                </TableCell>
                                <TableCell>
                                  {new Date(log.sentAt).toLocaleString(lang)}
                                </TableCell>
                                <TableCell>{log.type}</TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className='text-muted-foreground text-center'
                            >
                              Brak zarejestrowanych powiadomień.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>{' '}
                  {/* Close ScrollArea */}
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <div className='flex justify-between'>
                  <CardTitle className='flex items-center'>
                    <Paperclip className='mr-2 h-5 w-5' /> Załączniki
                  </CardTitle>
                  {deviation?._id &&
                    canAddAttachment && ( // Use the new check here
                      <AddAttachmentDialog
                        deviationId={deviation._id.toString()}
                        deviationStatus={deviation.status} // Pass status
                        deviationOwner={deviation.owner} // Pass owner
                        session={session} // Pass session
                      />
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Plik</TableHead>
                      <TableHead>Notatka</TableHead>
                      <TableHead>Dodał</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviation?.attachments &&
                    deviation.attachments.length > 0 ? (
                      [...deviation.attachments]
                        .sort(
                          (a, b) =>
                            new Date(b.uploadedAt).getTime() -
                            new Date(a.uploadedAt).getTime(),
                        )
                        .map((attachment, index) => (
                          <TableRow key={index}>
                            <TableCell>{attachment.name}</TableCell>
                            <TableCell>
                              <a
                                href={`/api/deviations/download?deviationId=${deviation._id?.toString()}&filename=${encodeURIComponent(attachment.filename)}`}
                                download={attachment.filename}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <Button variant='outline' size='icon'>
                                  <FileDown />
                                </Button>
                              </a>
                            </TableCell>
                            <TableCell className='max-w-[150px] truncate'>
                              {attachment.note || '-'}
                            </TableCell>
                            <TableCell className='whitespace-nowrap'>
                              {extractNameFromEmail(attachment.uploadedBy)}
                            </TableCell>
                            <TableCell>
                              {new Date(attachment.uploadedAt).toLocaleString(
                                lang,
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-muted-foreground text-center'
                        >
                          Brak załączników
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      {/* Render the Edit Log Dialog (conditionally) */}

      <EditLogDialog // RENAMED & UNCOMMENTED: Component
        isOpen={isEditLogDialogOpen} // RENAMED: State variable
        onClose={() => setIsEditLogDialogOpen(false)} // RENAMED: Setter
        logs={deviation?.editLogs || []} // RENAMED: Prop name and source
        lang={lang}
      />

      {/* You need to create the EditLogDialog component */}
    </Card>
  );
}
