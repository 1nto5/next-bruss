import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TemperatureChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Trend</CardTitle>
        <CardDescription>
          <span className="text-muted-foreground">Loading temperature data...</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full" />
      </CardContent>
    </Card>
  );
}