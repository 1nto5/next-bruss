import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Locale } from '@/i18n.config';
import OeeTimeSelector from '../components/oee-time-selector';
import OeeSummaryCards from '../components/oee-summary-cards';
import OeeUtilizationChart from '../components/oee-utilization-chart';

export default async function OvenOeePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;

  // Extract time selection parameters
  const mode = sp.mode || 'range';

  // Build params object based on mode
  let oeeParams:
    | { mode: 'day'; date: string }
    | { mode: 'week'; year: number; week: number }
    | { mode: 'month'; year: number; month: number }
    | { mode: 'range'; from: string; to: string; granularity?: 'hour' | 'day' }
    | null = null;

  switch (mode) {
    case 'day':
      if (sp.date) {
        oeeParams = { mode: 'day', date: sp.date };
      } else {
        // Default to today
        oeeParams = { mode: 'day', date: new Date().toISOString().split('T')[0] };
      }
      break;

    case 'week':
      const year = sp.year ? parseInt(sp.year) : new Date().getFullYear();
      const week = sp.week ? parseInt(sp.week) : 1;
      oeeParams = { mode: 'week', year, week };
      break;

    case 'month':
      const mYear = sp.year ? parseInt(sp.year) : new Date().getFullYear();
      const month = sp.month ? parseInt(sp.month) : new Date().getMonth() + 1;
      oeeParams = { mode: 'month', year: mYear, month };
      break;

    case 'range':
    default:
      // Default: last 30 days
      const to = sp.to || new Date().toISOString().split('T')[0];
      const defaultFrom = new Date();
      defaultFrom.setDate(defaultFrom.getDate() - 30);
      const from = sp.from || defaultFrom.toISOString().split('T')[0];
      oeeParams = { mode: 'range', from, to };
      break;
  }

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <Link href={`/${lang}/oven-data`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Oven Data
        </Button>
      </Link>

      {/* Main OEE Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Oven OEE Analysis</CardTitle>
              <CardDescription>
                Overall Equipment Effectiveness - All ovens combined utilization tracking
              </CardDescription>
            </div>
            <OeeTimeSelector />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {oeeParams && (
            <>
              <OeeSummaryCards params={oeeParams} />
              <OeeUtilizationChart params={oeeParams} lang={lang} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About OEE Calculation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Formula:</h4>
            <p className="text-sm text-muted-foreground">
              OEE = Availability × Performance × Quality
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-1">Availability</h4>
              <p className="text-sm text-muted-foreground">
                Actual running time / Total available time
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Measured from process start/end times
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Performance</h4>
              <p className="text-sm text-muted-foreground">
                100% (assumed optimal)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Assumes ovens run at ideal speed
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Quality</h4>
              <p className="text-sm text-muted-foreground">
                100% (assumed perfect)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Quality tracking handled separately
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Result:</strong> The OEE percentage shown represents the{' '}
              <strong>Availability</strong> metric - how much of the total oven
              capacity (across all configured ovens) was actively used during the
              selected time period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
