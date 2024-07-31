'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { DeviationReasonType, DeviationType } from '@/lib/types/deviation';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { addDeviationSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table as TableIcon } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export default function Deviation({
  reasons,
  deviation,
  lang,
  session,
}: {
  reasons: DeviationReasonType[];
  deviation: DeviationType | null;
  lang: string;
  session: Session | null;
}) {
  // const [isPendingInsert, setIsPendingInserting] = useState(false);
  // const [isPendingUpdateDraft, setIsPendingUpdatingDraft] = useState(false);
  const [isPendingApproval, startApprovalTransition] = useTransition();

  console.log('deviation', deviation);

  // 'group-leader': 'groupLeaderApproval',
  // 'quality-manager': 'qualityManagerApproval',
  // 'engineering-manager': 'engineeringManagerApproval',
  // 'maintenance-manager': 'maintenanceManagerApproval',
  // 'production-manager': 'productionManagerApproval',

  // const allUserRoles = session.user.roles;
  // const deviationUserRole = allUserRoles?.find((role) => {
  //   return [
  //     'group-leader',
  //     'quality-manager',
  //     'engineering-manager',
  //     'maintenance-manager',
  //     'production-manager',
  //   ].includes(role);
  // });

  // console.log('deviationUserRole', deviationUserRole);

  const handleApproval = async (role: string) => {
    startApprovalTransition(async () => {
      try {
        if (deviation && !deviation.id) {
          throw new Error('handleApproval: deviation.id is missing');
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

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Podgląd odchylenia</CardTitle>
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
                  <CardTitle>Akcje korygujące</CardTitle>
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
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Group Leader
                        </TableCell>
                        <TableCell>
                          {session?.user.roles?.includes('group-leader') && (
                            <Button
                              type='button'
                              onClick={() => console.log('test')}
                              variant='outline'
                            >
                              zatwierdź
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.by || '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.at
                            ? new Date(
                                deviation?.groupLeaderApproval?.at,
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Kierownik zapewnienia jakości
                        </TableCell>
                        <TableCell className='font-medium'>
                          {session?.user.roles?.includes('quality-manager') && (
                            <Button
                              type='button'
                              onClick={() => console.log('test')}
                              variant='outline'
                            >
                              zatwierdź
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.by || '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.at
                            ? new Date(
                                deviation?.groupLeaderApproval?.at,
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Kierownik Działu Inżynieryjnego
                        </TableCell>
                        <TableCell className='font-medium'>
                          {session?.user.roles?.includes(
                            'engineering-manager',
                          ) && (
                            <Button
                              type='button'
                              onClick={() => console.log('test')}
                              variant='outline'
                            >
                              zatwierdź
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.by || '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.at
                            ? new Date(
                                deviation?.groupLeaderApproval?.at,
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Kierownik Działu Utrzymania Ruchu
                        </TableCell>
                        <TableCell className='font-medium'>
                          {session?.user.roles?.includes(
                            'maintenance-manager',
                          ) && (
                            <Button
                              type='button'
                              onClick={() => console.log('test')}
                              variant='outline'
                            >
                              zatwierdź
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.by || '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.at
                            ? new Date(
                                deviation?.groupLeaderApproval?.at,
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className='font-medium'>
                          Kierownik Produkcji
                        </TableCell>
                        <TableCell className='font-medium'>
                          {session?.user.roles?.includes(
                            'production-manager',
                          ) && (
                            <Button
                              type='button'
                              onClick={() => console.log('test')}
                              variant='outline'
                            >
                              zatwierdź
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.by || '-'}
                        </TableCell>
                        <TableCell>
                          {deviation?.groupLeaderApproval?.at
                            ? new Date(
                                deviation?.groupLeaderApproval?.at,
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
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
                      <TableHead>Data</TableHead>
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