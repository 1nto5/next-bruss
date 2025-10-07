'use client';

import { Button } from '@/components/ui/button';

import {
  DeviationAreaType,
  DeviationReasonType,
  DeviationType,
} from '@/app/[lang]/deviations/lib/types';
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
  PrinterCheck, // NEW: Import PrinterIcon
  StickyNote, // Add StickyNote import
  Table as TableIcon,
  Wrench,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState, useTransition } from 'react'; // Import useState
import { toast } from 'sonner';
import { approveDeviation } from '../actions';
import AddAttachmentDialog from './add-attachment-dialog';
import AddNoteDialog from './add-note-dialog'; // Import the new component
import EditLogDialog from './edit-log-dialog'; // RENAMED & UNCOMMENTED: Import the dialog component
import PrintLogDialog from './print-log-dialog'; // NEW: Import PrintLogDialog
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
  const [isPrintLogDialogOpen, setIsPrintLogDialogOpen] = useState(false); // NEW: State for print log dialog

  // Pobieranie wszystkich ról użytkownika, które są uprawnione do zatwierdzania
  const deviationUserRoles =
    session?.user?.roles?.filter((role) => {
      // If user is a plant-manager, only allow plant-manager role for approvals
      if (session?.user?.roles?.includes('plant-manager')) {
        return role === 'plant-manager';
      }
      // Otherwise allow all approval roles
      return APPROVAL_ROLES.includes(role as ApprovalRole);
    }) || [];

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
              } else if (res.error === 'vacancy_required') {
                // New error type for plant manager trying to approve as non-vacant role
                reject(
                  new Error(
                    'Zatwierdzenie możliwe tylko dla wakatu na stanowisku!',
                  ),
                );
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
    // If user is a plant-manager, they can approve as any role (vacancy check happens in server action)
    if (userRoles.includes('plant-manager')) {
      return true;
    }

    // Direct role check
    if (userRoles.includes(targetRole)) {
      return true;
    }

    // Elevation check for production-manager
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
          <Badge variant='statusApproved' size='lg' className='text-lg'>
            Odchylenie zatwierdzone
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant='statusRejected' size='lg' className='text-lg'>
            Odchylenie odrzucone
          </Badge>
        );
      case 'in approval':
        return (
          <Badge
            variant='statusPending'
            size='lg'
            className='text-lg text-nowrap'
          >
            Odchylenie w trakcie zatwierdzania
          </Badge>
        );
      case 'in progress':
        return (
          <Badge variant='statusInProgress' size='lg' className='text-lg'>
            Odchylenie obowiązuje
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant='statusClosed' size='lg' className='text-lg'>
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
            {/* Add Print Log Button */}
            {deviation?.printLogs && deviation.printLogs.length > 0 && (
              <Button
                variant='outline'
                onClick={() => setIsPrintLogDialogOpen(true)}
                className='mb-2 sm:mb-0'
              >
                <PrinterCheck /> Historia wydruków
              </Button>
            )}
            <Link href='/deviations'>
              <Button variant='outline' className='mb-2 sm:mb-0'>
                {' '}
                {/* Add margin bottom */}
                <TableIcon /> Odchylenia
              </Button>
            </Link>
            {/* REMOVED: Edit button from here - moved to Details card */}
          </div>
        </div>
        <CardDescription>ID: {deviation?.internalId}</CardDescription>
      </CardHeader>
      <Separator className='mb-4' />
      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-y-0 lg:space-x-4'>
            <Card className='lg:w-5/12'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                  <CardTitle className='mb-2 flex items-center sm:mb-0'>
                    <LayoutList className='mr-2 h-5 w-5' /> Szczegóły
                  </CardTitle>
                  <div className='flex flex-wrap gap-2'>
                    {/* Edit History Button */}
                    {deviation?.editLogs && deviation.editLogs.length > 0 && (
                      <Button
                        variant='outline'
                        onClick={() => setIsEditLogDialogOpen(true)}
                      >
                        <History /> Historia
                      </Button>
                    )}
                    {/* MOVED: Edit button to here */}
                    {['in approval', 'rejected'].includes(
                      deviation?.status || '',
                    ) &&
                      (session?.user?.email === deviation?.owner ||
                        session?.user?.roles?.some((role) =>
                          [
                            'admin',
                            'group-leader',
                            'production-manager',
                            'quality-manager',
                            'plant-manager',
                          ].includes(role),
                        )) && (
                        <Link href={`/deviations/${deviation?._id}/edit`}>
                          <Button variant='outline'>
                            <Cog /> Edytuj
                          </Button>
                        </Link>
                      )}
                  </div>
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
            <div className='flex-col space-y-4 lg:w-7/12'>
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
                      {deviation?.correctiveActions &&
                      deviation.correctiveActions.length > 0 ? (
                        deviation.correctiveActions.map(
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
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className='text-muted-foreground text-center'
                          >
                            Brak akcji korygujących
                          </TableCell>
                        </TableRow>
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
                  <CardDescription>
                    {!session && (
                      <span>
                        Aby uzyskać dostęp do opcji zatwierdzania,{' '}
                        <Link
                          href={`/${lang}/auth?callbackUrl=${encodeURIComponent(`/${lang}/deviations/${deviation?._id}`)}`}
                          className='text-blue-600 underline hover:text-blue-800'
                        >
                          zaloguj się
                        </Link>
                        .
                      </span>
                    )}
                  </CardDescription>
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
                          deviationStatus={deviation?.status}
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
                          deviationStatus={deviation?.status}
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
                          deviationStatus={deviation?.status}
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
                          deviationStatus={deviation?.status}
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

          {/* Add new card for notes */}
          <div>
            <Card>
              <CardHeader>
                <div className='flex justify-between'>
                  <CardTitle className='flex items-center'>
                    <StickyNote className='mr-2 h-5 w-5' /> Notatki
                  </CardTitle>
                  {deviation?._id && session && (
                    <AddNoteDialog deviationId={deviation._id.toString()} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Osoba</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Notatka</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviation?.notes && deviation.notes.length > 0 ? (
                      [...deviation.notes]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((note, index) => (
                          <TableRow key={index}>
                            <TableCell className='whitespace-nowrap'>
                              {extractNameFromEmail(note.createdBy)}
                            </TableCell>
                            <TableCell>
                              {new Date(note.createdAt).toLocaleString(lang)}
                            </TableCell>
                            <TableCell className='whitespace-pre-line'>
                              {note.content}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='text-muted-foreground text-center'
                        >
                          Brak notatek
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

      {/* NEW: Print Log Dialog */}
      <PrintLogDialog
        isOpen={isPrintLogDialogOpen}
        onClose={() => setIsPrintLogDialogOpen(false)}
        logs={deviation?.printLogs || []}
        lang={lang}
      />
    </Card>
  );
}
