'use client';

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
import { DeviationType } from '@/lib/types/deviation';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { CopyPlus, Plus, Table as TableIcon } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { approveDeviation } from '../actions';
import TableCellsApprove from './TableCellApproveRole';

export default function Deviation({
  deviation,
  lang,
  session,
}: {
  deviation: DeviationType | null;
  lang: string;
  session: Session | null;
}) {
  // const [isPendingInsert, setIsPendingInserting] = useState(false);
  // const [isPendingUpdateDraft, setIsPendingUpdatingDraft] = useState(false);
  const [isPendingApproval, startApprovalTransition] = useTransition();

  // 'group-leader': 'groupLeaderApproval',
  // 'quality-manager': 'qualityManagerApproval',
  // 'engineering-manager': 'engineeringManagerApproval',
  // 'maintenance-manager': 'maintenanceManagerApproval',
  // 'production-manager': 'productionManagerApproval',

  const deviationUserRole = session?.user.roles?.find((role) => {
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
        if (!deviation?._id) {
          console.error('handleApproval', 'deviation.id is missing');
          toast.error('Skontaktuj się z IT!');
          return;
        }

        console.log(
          'handleApproval',
          'deviation.id',
          deviation._id,
          'deviationUserRole',
          deviationUserRole,
        );

        if (deviation._id && deviationUserRole) {
          console.log('tu');
          const res = await approveDeviation(
            deviation._id.toString(),
            deviationUserRole,
          );
          if (res.success) {
            toast.success('Zatwierdzono!');
          } else if (res.error) {
            console.error('handleApproval', res.error);
            toast.error('Skontaktuj się z IT!');
          }
        }

        // if (articleNumber.length === 5) {
        //   const res = await findArticleName(articleNumber);
        //   if (res.success) {
        //     form.setValue('articleName', res.success);
        //   } else if (res.error === 'not found') {
        //     toast.error('Nie znaleziono artykułu');
        //   } else if (res.error) {
        //     console.error(res.error);
        //     toast.error('Skontaktuj się z IT!');
        //   }
        // } else {
        //   toast.error('Wprowadź poprawny numer artykułu');
        // }
      } catch (error) {
        console.error('handleFindArticleName', error);
        toast.error('Skontaktuj się z IT!');
      }
    });
  };

  // const onSubmit = async (data: z.infer<typeof addDeviationSchema>) => {
  //   setIsPendingInserting(true);
  //   if (!deviation?.id) {
  //     console.error('onSubmit', 'deviation.id is missing');
  //     toast.error('Skontaktuj się z IT!');
  //     return;
  //   }
  //   try {
  //     const res = await insertDeviationFromDraft(deviation.id, data);
  //     if (res.success) {
  //       toast.success('Odchylenie dodane!');
  //       // form.reset()
  //       redirectToDeviations();
  //     } else if (res.error) {
  //       console.error('onSubmit', res.error);
  //       toast.error('Skontaktuj się z IT!');
  //     }
  //   } catch (error) {
  //     console.error('onSubmit', error);
  //     toast.error('Skontaktuj się z IT!');
  //   } finally {
  //     setIsPendingInserting(false);
  //   }
  // };

  // const handleDraftUpdate = async (
  //   data: z.infer<typeof addDeviationDraftSchema>,
  // ) => {
  //   setIsPendingUpdatingDraft(true);
  //   if (!deviation?.id) {
  //     console.error('onSubmit', 'deviation.id is missing');
  //     toast.error('Skontaktuj się z IT!');
  //     return;
  //   }
  //   try {
  //     const res = await updateDraftDeviation(deviation?.id, data);
  //     if (res.success) {
  //       toast.success('Szkic zapisany!');
  //       // form.reset();
  //       redirectToDeviations();
  //     } else if (res.error) {
  //       console.error('handleDraftUpdate', res.error);
  //       toast.error('Skontaktuj się z IT!');
  //     }
  //   } catch (error) {
  //     console.error('handleDraftUpdate', error);
  //     toast.error('Skontaktuj się z IT!');
  //   } finally {
  //     setIsPendingUpdatingDraft(false);
  //   }
  // };

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
            <Button size='icon' variant='outline'>
              <TableIcon />
            </Button>
          </Link>
        </div>
        <CardDescription>ID: {deviation?._id?.toString()}</CardDescription>
      </CardHeader>
      <Separator className='mb-4' />
      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-x-4 lg:space-y-0'>
            <Card className='lg:w-2/5'>
              <CardHeader>
                <CardTitle>Szczegóły</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-medium'>Numer:</TableCell>
                      <TableCell>{deviation?.articleNumber || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Artykuł:</TableCell>
                      <TableCell>{deviation?.articleName || '-'}</TableCell>
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
                        {`${deviation?.quantity?.value} ${deviation?.quantity?.unit === 'pcs' ? 'szt.' : deviation?.quantity?.unit || ''}` ||
                          '-'}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Partia:</TableCell>
                      <TableCell>{deviation?.charge || '-'}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>Powód:</TableCell>
                      <TableCell>{deviation?.reason || '-'}</TableCell>
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
                      <TableCell>{deviation?.area || '-'}</TableCell>
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
                        Numer części klienta:
                      </TableCell>
                      <TableCell>{deviation?.customerNumber || '-'}</TableCell>
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

                    <Link href={`/deviations/${deviation?._id}/corrective/add`}>
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
                        <TableHead>Akcja</TableHead>
                        <TableHead>Wykonawca</TableHead>
                        <TableHead>Termin</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Testowa akcja korygująca
                        </TableCell>
                        <TableCell>
                          {deviation?.owner
                            ? extractNameFromEmail(deviation.owner)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.createdAt
                            ? new Date(deviation?.createdAt).toLocaleDateString(
                                lang,
                              )
                            : '-'}
                        </TableCell>
                        <TableCell>Nie jest dobrze</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Testowa akcja korygująca
                        </TableCell>
                        <TableCell>
                          {deviation?.owner
                            ? extractNameFromEmail(deviation.owner)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.createdAt
                            ? new Date(deviation?.createdAt).toLocaleDateString(
                                lang,
                              )
                            : '-'}
                        </TableCell>
                        <TableCell>Nie jest dobrze</TableCell>
                      </TableRow>
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
                        <TableHead></TableHead>

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
                          approved={deviation?.groupLeaderApproval?.approved}
                          handleApproval={handleApproval}
                          by={deviation?.groupLeaderApproval?.by}
                          at={deviation?.groupLeaderApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Zapewnienia Jakości'
                          deviationUserRole={deviationUserRole}
                          role='quality-manager'
                          approved={deviation?.qualityManagerApproval?.approved}
                          handleApproval={handleApproval}
                          by={deviation?.qualityManagerApproval?.by}
                          at={deviation?.qualityManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Działu Inżynieryjnego'
                          deviationUserRole={deviationUserRole}
                          role='engineering-manager'
                          approved={
                            deviation?.engineeringManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={deviation?.engineeringManagerApproval?.by}
                          at={deviation?.engineeringManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Działu Utrzymania Ruchu'
                          deviationUserRole={deviationUserRole}
                          role='maintenance-manager'
                          approved={
                            deviation?.maintenanceManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={deviation?.maintenanceManagerApproval?.by}
                          at={deviation?.maintenanceManagerApproval?.at.toString()}
                          lang={lang}
                        />
                      </TableRow>
                      <TableRow>
                        <TableCellsApprove
                          roleText='Kierownik Produkcji'
                          deviationUserRole={deviationUserRole}
                          role='production-manager'
                          approved={
                            deviation?.productionManagerApproval?.approved
                          }
                          handleApproval={handleApproval}
                          by={deviation?.productionManagerApproval?.by}
                          at={deviation?.productionManagerApproval?.at.toString()}
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
          <div>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
