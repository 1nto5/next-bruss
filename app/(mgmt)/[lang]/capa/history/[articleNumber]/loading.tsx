import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Container from '@/components/ui/container';

import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw, TableIcon } from 'lucide-react';

export default function Loading() {
  return (
    <Container>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>CAPA</CardTitle>
            <CardDescription>Ładowanie...</CardDescription>
            <div className='flex items-center justify-end space-x-1'>
              <Button size='icon' variant='outline'>
                <TableIcon />
              </Button>

              <Button size='icon' variant='outline' disabled>
                <RefreshCcw />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
              <Skeleton className='h-16 w-full'></Skeleton>
            </div>
          </CardContent>
        </Card>
      </main>
    </Container>
  );
}
