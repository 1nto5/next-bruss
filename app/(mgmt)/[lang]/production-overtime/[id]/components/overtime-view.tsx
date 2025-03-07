'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

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
// import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { CopyPlus, Table as TableIcon } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { OvertimeType } from '../../lib/production-overtime-types';
import {
  approveDeviation,
  revalidateDeviation,
  sendReminderEmail,
} from '../actions';
import TableCellsApprove from './table-cell-approve-role';
import TableCellCorrectiveAction from './table-cell-corrective-action';

export default function Overtime({
  overtime,
  lang,
  session,
  fetchTime,
}: {
  overtime: OvertimeType;
  lang: string;
  session: Session | null;
  fetchTime: string;
}) {
  useEffect(() => {
    const interval = setInterval(() => {
      revalidateDeviation();
    }, 1000 * 15); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const [isPendingApproval, startApprovalTransition] = useTransition();

  const deviationUserRole = session?.user?.roles?.find((role) => {
    return [
      'group-leader',
      'quality-manager',
      'engineering-manager',
      'maintenance-manager',
      'production-manager',
    ].includes(role);
  });

  const handleApproval = async () => {
    startApprovalTransition(async () => {
      try {
        if (!overtime?._id) {
          console.error('handleApproval', 'deviation.id is missing');
          toast.error('Skontaktuj się z IT!');
          return;
        }

        if (overtime._id && deviationUserRole) {
          console.log('tu');
          const res = await approveDeviation(
            overtime._id.toString(),
            deviationUserRole,
          );
          if (res.success) {
            toast.success('Zatwierdzono!');
          } else if (res.error) {
            console.error('handleApproval', res.error);
            toast.error('Skontaktuj się z IT!');
          }
        }
      } catch (error) {
        console.error('handleFindArticleName', error);
        toast.error('Skontaktuj się z IT!');
      }
    });
  };

  const handleSendReminderEmail = async () => {
    try {
      if (!overtime?._id) {
        console.error('handleSendReminderEmail', 'deviation.id is missing');
        toast.error('Skontaktuj się z IT!');
        return;
      }
      const res = await sendReminderEmail(overtime._id.toString());
      if (res.success) {
        toast.success('Wysłano przypomnienie!');
      } else if (res.error) {
        console.error('handleSendReminderEmail', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('handleSendReminderEmail', error);
      toast.error('Skontaktuj się z IT!');
    }
  };

  const statusCardTitle = () => {
    switch (overtime?.status) {
      case 'approved':
        return 'Zlecenie zatwierdzone';
      case 'rejected':
        return 'Zlecenie odrzucone';
      case 'pending':
        return 'Zlecenie oczekuje na zatwierdzenie';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>{statusCardTitle()}</CardTitle>
          <Link href='/production-overtime'>
            <Button size='icon' variant='outline'>
              <TableIcon />
            </Button>
          </Link>
        </div>
        <CardDescription>
          ID: {overtime?._id?.toString()}, ostatnia synchronizacja: {fetchTime}
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
                        {overtime?.createdAt
                          ? new Date(overtime.createdAt).toLocaleString(lang)
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Właściciel:</TableCell>
                      <TableCell>
                        {extractNameFromEmail(overtime?.owner || '') || '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Numer:</TableCell>
                      <TableCell>{overtime?.articleNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Artykuł:</TableCell>
                      <TableCell>{overtime?.articleName || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Numer części klienta:
                      </TableCell>
                      <TableCell>{overtime?.customerNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Nazwa części klienta:
                      </TableCell>
                      <TableCell>{overtime?.customerNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Stanowisko:</TableCell>
                      <TableCell>{overtime?.workplace || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Nr. rysunku</TableCell>
                      <TableCell>{overtime?.drawingNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Ilość:</TableCell>
                      <TableCell>
                        {`${overtime?.quantity?.value || '-'} ${overtime?.quantity?.unit === 'pcs' ? 'szt.' : overtime?.quantity?.unit || ''}`}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Partia:</TableCell>
                      <TableCell>{overtime?.charge || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Powód:</TableCell>
                      <TableCell>{overtime?.reason || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Obowiązuje:</TableCell>
                      <TableCell>
                        {overtime?.timePeriod?.from && overtime?.timePeriod?.to
                          ? `${new Date(overtime?.timePeriod?.from).toLocaleDateString(lang)} - ${new Date(overtime?.timePeriod?.to).toLocaleDateString(lang)}`
                          : '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Obszar:</TableCell>
                      <TableCell>{overtime?.area || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Opis:</TableCell>
                      <TableCell>{overtime?.description || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Specyfikacja procesu:
                      </TableCell>
                      <TableCell>
                        {overtime?.processSpecification || '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Autoryzacja klienta:
                      </TableCell>
                      <TableCell>
                        {overtime?.customerAuthorization ? 'Tak' : 'Nie'}
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
                    {/* TODO: who should have access to add corrective actions? */}
                    <Link href={`/overtimes/${overtime?._id}/corrective/add`}>
                      <Button size='icon' variant='outline'>
                        <CopyPlus />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='min-w-[250px]'>Akcja</TableHead>
                        <TableHead>Wykonawca</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Zmiana statusu</TableHead>
                        <TableHead>Aktualizacja</TableHead>
                        <TableHead>Historia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overtime?.correctiveActions?.map(
                        (correctiveAction, index) => (
                          <TableRow key={index}>
                            <TableCellCorrectiveAction
                              correctiveAction={correctiveAction}
                              correctiveActionIndex={index}
                              deviationId={overtime?._id?.toString() || ''}
                              lang={lang}
                              user={session?.user?.email}
                              userRoles={session?.user?.roles}
                              deviationOwner={overtime?.owner}
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
                        <TableHead>Czas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Group Leader'
                          deviationUserRole={deviationUserRole}
                          role='group-leader'
                          approved={overtime?.groupLeaderApproval?.approved}
                          handleApproval={handleApproval}
                          by={overtime?.groupLeaderApproval?.by}
                          at={overtime?.groupLeaderApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Zapewnienia Jakości'
                          deviationUserRole={deviationUserRole}
                          role='quality-manager'
                          approved={overtime?.qualityManagerApproval?.approved}
                          handleApproval={handleApproval}
                          by={overtime?.qualityManagerApproval?.by}
                          at={overtime?.qualityManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Działu Inżynieryjnego'
                          deviationUserRole={deviationUserRole}
                          role='engineering-manager'
                          approved={
                            overtime?.engineeringManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={overtime?.engineeringManagerApproval?.by}
                          at={overtime?.engineeringManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Działu Utrzymania Ruchu'
                          deviationUserRole={deviationUserRole}
                          role='maintenance-manager'
                          approved={
                            overtime?.maintenanceManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={overtime?.maintenanceManagerApproval?.by}
                          at={overtime?.maintenanceManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Produkcji'
                          deviationUserRole={deviationUserRole}
                          role='production-manager'
                          approved={
                            overtime?.productionManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={overtime?.productionManagerApproval?.by}
                          at={overtime?.productionManagerApproval?.at.toString()}
                          lang={lang}
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
                <CardTitle>Załączniki</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Osoba</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Analiza ryzyka</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Analiza ryzyka</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Analiza ryzyka</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {/* <div>
            <Card>
              <CardHeader>
                <CardTitle>Historia</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Czas</TableHead>
                      <TableHead>Osoba</TableHead>
                      <TableHead>Akcja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2021-09-01</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-09-01</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-09-01</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-09-01</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-09-01</TableCell>
                      <TableCell>Jan Kowalski</TableCell>
                      <TableCell>Utworzono</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
