import { auth } from '@/auth';
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
import { Locale } from '@/i18n.config';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import {
  CalendarClock,
  Clock,
  Download,
  LayoutList,
  Package,
  Table as TableIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOvertimeRequest } from '../lib/get-overtime-request';
import { getDepartmentDisplayName } from '../lib/types';

function getStatusBadge(status: string) {
  switch (status) {
    case 'forecast':
      return (
        <Badge variant='statusForecast' size='lg' className='text-lg'>
          Forecast
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant='statusPending' size='lg' className='text-lg'>
          Oczekuje na zatwierdzenie
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant='statusApproved' size='lg' className='text-lg'>
          Zatwierdzone
        </Badge>
      );
    case 'canceled':
      return (
        <Badge variant='statusRejected' size='lg' className='text-lg'>
          Anulowane
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant='statusClosed' size='lg' className='text-lg'>
          Ukończone
        </Badge>
      );
    case 'accounted':
      return (
        <Badge variant='statusAccounted' size='lg' className='text-lg'>
          Rozliczone
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

function calculateTotalHours(
  from: Date,
  to: Date,
  numberOfEmployees: number,
  numberOfShifts: number,
): string {
  const hoursPerEmployee = (to.getTime() - from.getTime()) / (1000 * 60 * 60);
  const totalHours = (hoursPerEmployee * numberOfEmployees) / numberOfShifts;
  return `${Math.round(totalHours * 100) / 100}h`;
}

function formatDuration(from: Date, to: Date): string {
  const durationMs = to.getTime() - from.getTime();
  const hours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
  return `${hours}h`;
}

export default async function OvertimeDetailsPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  let overtimeRequestLocaleString;
  try {
    ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));
  } catch (error) {
    console.error('Error fetching overtime request:', error);
    redirect(`/overtime-orders`);
  }

  const request = overtimeRequestLocaleString;

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='mb-2 sm:mb-0'>
            {getStatusBadge(request.status)}
          </CardTitle>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {/* Download attachment button */}
            {request.hasAttachment && (
              <Link
                href={`/api/overtime-orders/download?overTimeRequestId=${request._id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full sm:w-auto'
              >
                <Button variant='outline' className='w-full'>
                  <Download /> Lista obecności
                </Button>
              </Link>
            )}

            {/* Manage employees button */}
            <Link
              href={`/overtime-orders/${id}/employees`}
              className='w-full sm:w-auto'
            >
              <Button variant='outline' className='w-full'>
                <Users /> Obiór nadgodzin
              </Button>
            </Link>

            {/* Analytics button */}
            <Link
              href={`/overtime-orders/forecast`}
              className='w-full sm:w-auto'
            >
              <Button variant='outline' className='w-full'>
                <TrendingUp /> Forecast
              </Button>
            </Link>

            {/* Back to table button */}
            <Link href={`/overtime-orders`} className='w-full sm:w-auto'>
              <Button variant='outline' className='w-full'>
                <TableIcon /> Zlecenia
              </Button>
            </Link>
          </div>
        </div>
        <CardDescription>ID: {request.internalId}</CardDescription>
      </CardHeader>
      <Separator className='mb-4' />

      <CardContent>
        <div className='flex-col space-y-4'>
          <div className='space-y-4 lg:flex lg:justify-between lg:space-y-0 lg:space-x-4'>
            {/* Left Column - Details */}
            <Card className='lg:w-5/12'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                  <CardTitle className='mb-2 flex items-center sm:mb-0'>
                    <LayoutList className='mr-2 h-5 w-5' /> Szczegóły zlecenia
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-medium'>Utworzono:</TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleString(lang)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Wystawione przez:
                      </TableCell>
                      <TableCell>
                        {extractNameFromEmail(request.requestedBy)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Osoba odpowiedzialna:
                      </TableCell>
                      <TableCell>
                        {extractNameFromEmail(request.responsibleEmployee)}
                      </TableCell>
                    </TableRow>

                    {request.department && (
                      <TableRow>
                        <TableCell className='font-medium'>
                          Dział:
                        </TableCell>
                        <TableCell>
                          {getDepartmentDisplayName(request.department)}
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell className='font-medium'>
                        Rozpoczęcie:
                      </TableCell>
                      <TableCell>
                        {new Date(request.from).toLocaleString(lang)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Zakończenie:
                      </TableCell>
                      <TableCell>
                        {new Date(request.to).toLocaleString(lang)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Czas trwania:
                      </TableCell>
                      <TableCell>
                        {formatDuration(
                          new Date(request.from),
                          new Date(request.to),
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Liczba zmian:
                      </TableCell>
                      <TableCell>{request.numberOfShifts || 1}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Planowana liczba pracowników:
                      </TableCell>
                      <TableCell>{request.numberOfEmployees}</TableCell>
                    </TableRow>

                    {request.actualEmployeesWorked !== undefined && (
                      <TableRow>
                        <TableCell className='font-medium'>
                          Rzeczywista liczba pracowników:
                        </TableCell>
                        <TableCell>{request.actualEmployeesWorked}</TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell className='font-medium'>
                        Pracownicy odbierający dni wolne:
                      </TableCell>
                      <TableCell>
                        {request.employeesWithScheduledDayOff?.length || 0}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Łączna liczba godzin:
                      </TableCell>
                      <TableCell>
                        {calculateTotalHours(
                          new Date(request.from),
                          new Date(request.to),
                          request.numberOfEmployees,
                          request.numberOfShifts || 1,
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='font-medium'>
                        Uzasadnienie:
                      </TableCell>
                      <TableCell className='max-w-[200px] break-words'>
                        {request.reason}
                      </TableCell>
                    </TableRow>

                    {request.note && (
                      <TableRow>
                        <TableCell className='font-medium'>
                          Dodatkowe informacje:
                        </TableCell>
                        <TableCell className='max-w-[200px] break-words'>
                          {request.note}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Right Column - Multiple Cards */}
            <div className='flex-col space-y-4 lg:w-7/12'>
              {/* Production Information Card */}
              {((request.plannedArticles &&
                request.plannedArticles.length > 0) ||
                (request.actualArticles &&
                  request.actualArticles.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Package className='mr-2 h-5 w-5' /> Informacje o
                      produkcji
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      {/* Planned Articles */}
                      {request.plannedArticles &&
                        request.plannedArticles.length > 0 && (
                          <div>
                            <h4 className='mb-3 text-lg font-medium'>
                              Planowana produkcja
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Artykuł</TableHead>
                                  <TableHead className='text-right'>
                                    Ilość
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {request.plannedArticles.map(
                                  (article, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {article.articleNumber}
                                      </TableCell>
                                      <TableCell className='text-right'>
                                        {article.quantity} szt.
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                      {/* Actual Articles */}
                      {request.actualArticles &&
                        request.actualArticles.length > 0 && (
                          <div>
                            <h4 className='mb-3 text-lg font-medium'>
                              Rzeczywista produkcja
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Artykuł</TableHead>
                                  <TableHead className='text-right'>
                                    Ilość
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {request.actualArticles.map(
                                  (article, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {article.articleNumber}
                                      </TableCell>
                                      <TableCell className='text-right'>
                                        {article.quantity} szt.
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Employees with Day Off Card */}
              {request.employeesWithScheduledDayOff &&
                request.employeesWithScheduledDayOff.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className='flex justify-between'>
                        <CardTitle className='flex items-center'>
                          <CalendarClock className='mr-2 h-5 w-5' /> Pracownicy
                          odbierający dni wolne
                        </CardTitle>
                        <Link
                          href={`/overtime-orders/${id}/employees`}
                          className='w-full sm:w-auto'
                        >
                          <Button variant='outline' className='w-full'>
                            <Users /> Zarządzaj
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pracownik</TableHead>
                            <TableHead>Nr pers.</TableHead>
                            <TableHead>Data odbioru</TableHead>
                            <TableHead>Uwagi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {request.employeesWithScheduledDayOff.map(
                            (employee, index) => (
                              <TableRow key={index}>
                                <TableCell className='font-medium'>
                                  {employee.firstName} {employee.lastName}
                                </TableCell>
                                <TableCell>{employee.identifier}</TableCell>
                                <TableCell>
                                  {employee.agreedReceivingAt
                                    ? new Date(
                                        employee.agreedReceivingAt,
                                      ).toLocaleDateString(lang)
                                    : 'Nie ustalono'}
                                </TableCell>
                                <TableCell className='max-w-[150px] truncate'>
                                  {employee.note || '-'}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

              {/* Status History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Clock className='mr-2 h-5 w-5' /> Historia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Osoba</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Created */}
                      <TableRow>
                        <TableCell>
                          <Badge variant='outline'>Utworzone</Badge>
                        </TableCell>
                        <TableCell>
                          {extractNameFromEmail(request.requestedBy)}
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleString(lang)}
                        </TableCell>
                      </TableRow>

                      {/* Approved */}
                      {request.approvedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusApproved'>Zatwierdzone</Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(request.approvedBy || '')}
                          </TableCell>
                          <TableCell>
                            {new Date(request.approvedAt).toLocaleString(lang)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Completed */}
                      {request.completedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusClosed'>Ukończone</Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(request.completedBy || '')}
                          </TableCell>
                          <TableCell>
                            {new Date(request.completedAt).toLocaleString(lang)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Accounted */}
                      {request.accountedAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusAccounted'>Rozliczone</Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(request.accountedBy || '')}
                          </TableCell>
                          <TableCell>
                            {new Date(request.accountedAt).toLocaleString(lang)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Canceled */}
                      {request.canceledAt && (
                        <TableRow>
                          <TableCell>
                            <Badge variant='statusRejected'>Anulowane</Badge>
                          </TableCell>
                          <TableCell>
                            {extractNameFromEmail(request.canceledBy || '')}
                          </TableCell>
                          <TableCell>
                            {new Date(request.canceledAt).toLocaleString(lang)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
