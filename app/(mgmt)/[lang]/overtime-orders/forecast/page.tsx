import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { Table, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ForecastCharts from '../components/forecast-charts';
import ForecastFiltering from '../components/forecast-filtering';
import { getForecastData } from '../lib/get-forecast-data';
import { ForecastFilterType } from '../lib/types';

export default async function ForecastPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { lang } = params;

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  // Parse search parameters with defaults
  const filterType = (searchParams.filterType as ForecastFilterType) || 'week';
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const currentWeek = Math.ceil(
    ((currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) /
      86400000 +
      new Date(currentYear, 0, 1).getDay() +
      1) /
      7,
  );

  const year = searchParams.year ? parseInt(searchParams.year) : currentYear;
  const startValue = searchParams.startValue
    ? parseInt(searchParams.startValue)
    : filterType === 'week'
      ? Math.max(1, currentWeek - 4)
      : 1;
  const endValue = searchParams.endValue
    ? parseInt(searchParams.endValue)
    : filterType === 'week'
      ? Math.min(52, currentWeek + 4)
      : filterType === 'month'
        ? 12
        : currentYear;
  const department = searchParams.department || undefined;

  let forecastData;
  let fetchTime;
  let fetchTimeLocaleString;
  let error = null;


  try {
    const result = await getForecastData(
      filterType,
      year,
      startValue,
      endValue,
      session.user.email,
      department,
    );
    forecastData = result.forecastData;
    fetchTime = result.fetchTime;
    fetchTimeLocaleString = result.fetchTimeLocaleString;
  } catch (err) {
    console.error('Error fetching forecast data:', err);
    error = 'Nie udało się pobrać danych forecast. Spróbuj ponownie.';
    // Set default values to prevent crashes
    forecastData = {
      data: [],
      summary: {
        totalForecastHours: 0,
        totalHistoricalHours: 0,
        totalForecastCount: 0,
        totalHistoricalCount: 0,
        filterType,
        year,
        startValue,
        endValue,
      },
    };
    fetchTime = new Date();
    fetchTimeLocaleString = fetchTime.toLocaleString();
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex items-center gap-2'>
            Forecast nadgodzin - produkcja
          </CardTitle>

          <div className='flex gap-2'>
            <Link href='/overtime-orders' className='w-full sm:w-auto'>
              <Button variant='outline' className='w-full'>
                <Table />
                Zlecenia
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Filtering */}
        <ForecastFiltering
          fetchTime={fetchTime}
          isLogged={!!session.user?.email}
        />

        {/* Error Display */}
        {error && (
          <Card className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 text-red-600 dark:text-red-400'>
                <span className='text-sm font-medium'>Błąd:</span>
                <span className='text-sm'>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts and Data */}
        {!error && forecastData && (
          <>
            {/* No Data Message */}
            {forecastData.data.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <TrendingUp className='text-muted-foreground mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>Brak danych</h3>
                  <p className='text-muted-foreground max-w-md text-center'>
                    Nie znaleziono żadnych zleceń nadgodzin dla wybranego
                    okresu. Spróbuj zmienić zakres dat lub typ agregacji.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ForecastCharts
                data={forecastData.data}
                summary={forecastData.summary}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
