'use client';

import { Button } from '@/components/ui/button';

import {
  DeviationAreaType,
  DeviationReasonType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
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
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { FileDown, Hammer, Table as TableIcon } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { approveDeviation } from '../actions';
import AddAttachmentDialog from './add-attachment-dialog';
import TableCellsApprove from './table-cell-approve-role';
import TableCellCorrectiveAction from './table-cell-corrective-action';

// Lista dozwolonych ról do zatwierdzania odchyleń
const APPROVAL_ROLES = [
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

  // Pobieranie wszystkich ról użytkownika, które są uprawnione do zatwierdzania
  const deviationUserRoles =
    session?.user?.roles?.filter((role) =>
      APPROVAL_ROLES.includes(role as ApprovalRole),
    ) || [];

  const handleApproval = async (approvalRole: string) => {
    startApprovalTransition(async () => {
      try {
        if (!deviation?._id) {
          toast.error('Skontaktuj się z IT!');
          return;
        }

        // Sprawdzamy, czy użytkownik posiada rolę, którą próbuje wykorzystać do zatwierdzenia
        if (
          deviation?._id &&
          deviationUserRoles.includes(approvalRole as ApprovalRole)
        ) {
          const res = await approveDeviation(
            deviation._id.toString(),
            approvalRole,
          );
          if (res.success) {
            toast.success('Zatwierdzono!');
          } else if (res.error) {
            toast.error('Skontaktuj się z IT!');
          }
        } else {
          toast.error('Nie posiadasz uprawnień do zatwierdzenia w tej roli!');
        }
      } catch (error) {
        toast.error('Skontaktuj się z IT!');
      }
    });
  };

  const statusCardTitle = () => {
    switch (deviation?.status) {
      case 'approved':
        return 'Odchylenie zatwierdzone';
      case 'rejected':
        return 'Odchylenie odrzucone';
      case 'approval':
        return 'Odchylenie w trakcie zatwierdzania';
      case 'valid':
        return 'Odchylenie obowiazuje';
      case 'closed':
        return 'Odchylenie zamknięte';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>{statusCardTitle()}</CardTitle>
          <Link href='/deviations'>
            <Button variant='outline'>
              <TableIcon /> Odchylenia
            </Button>
          </Link>
        </div>
        <CardDescription className='flex flex-col'>
          <span>ID: {deviation?._id?.toString()}</span>
          <span>Ostatnia synchronizacja: {fetchTime.toLocaleString(lang)}</span>
        </CardDescription>
      </CardHeader>
      <Separator className='mb-4' />
      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-y-0 lg:space-x-4'>
            <Card className='lg:w-2/5'>
              <CardHeader>
                <CardTitle>Szczegóły</CardTitle>
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
                      <TableCell className='font-medium'>Numer:</TableCell>
                      <TableCell>{deviation?.articleNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Artykuł:</TableCell>
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
                        Nazwa części klienta:
                      </TableCell>
                      <TableCell>{deviation?.customerNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Stanowisko:</TableCell>
                      <TableCell>{deviation?.workplace || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Nr. rysunku</TableCell>
                      <TableCell>{deviation?.drawingNumber || '-'}</TableCell>
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
                      <TableCell className='font-medium'>Opis:</TableCell>
                      <TableCell>{deviation?.description || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Specyfikacja procesu:
                      </TableCell>
                      <TableCell>
                        {deviation?.processSpecification || '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Autoryzacja klienta:
                      </TableCell>
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
                    <CardTitle>Akcje korygujące</CardTitle>
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
                        <TableHead>Opis</TableHead>
                        <TableHead>Wykonawca</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Zmiana statusu</TableHead>
                        <TableHead>Aktualizacja</TableHead>
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
                  <CardTitle>Zatwierdzenia</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stanowisko</TableHead>
                        <TableHead>Zatwierdź</TableHead>
                        <TableHead>Osoba</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Group Leader'
                          deviationUserRoles={deviationUserRoles}
                          role='group-leader'
                          approved={deviation?.groupLeaderApproval?.approved}
                          handleApproval={() => handleApproval('group-leader')}
                          by={deviation?.groupLeaderApproval?.by}
                          at={deviation?.groupLeaderApproval?.at?.toString()}
                          lang={lang}
                          isPendingApproval={isPendingApproval}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Jakości'
                          deviationUserRoles={deviationUserRoles}
                          role='quality-manager'
                          approved={deviation?.qualityManagerApproval?.approved}
                          handleApproval={() =>
                            handleApproval('quality-manager')
                          }
                          by={deviation?.qualityManagerApproval?.by}
                          at={deviation?.qualityManagerApproval?.at?.toString()}
                          lang={lang}
                          isPendingApproval={isPendingApproval}
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
                          handleApproval={() =>
                            handleApproval('production-manager')
                          }
                          by={deviation?.productionManagerApproval?.by}
                          at={deviation?.productionManagerApproval?.at?.toString()}
                          lang={lang}
                          isPendingApproval={isPendingApproval}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Dyrektor Zakładu'
                          deviationUserRoles={deviationUserRoles}
                          role='plant-manager'
                          approved={deviation?.plantManagerApproval?.approved}
                          handleApproval={() => handleApproval('plant-manager')}
                          by={deviation?.plantManagerApproval?.by}
                          at={deviation?.plantManagerApproval?.at?.toString()}
                          lang={lang}
                          isPendingApproval={isPendingApproval}
                        />
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <div className='flex justify-between'>
                  <CardTitle>Załączniki</CardTitle>
                  {deviation?._id && (
                    <AddAttachmentDialog
                      deviationId={deviation._id.toString()}
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
    </Card>
  );
}
