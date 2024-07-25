import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Container from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyPlus, RefreshCcw } from 'lucide-react';

export default function Loading() {
  return (
    <Container>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Odchylenia</CardTitle>
            <CardDescription>Ładowanie...</CardDescription>
            <div className='flex items-center justify-between'>
              <div className='flex flex-row space-x-1'>
                <Input placeholder='id' disabled className='w-24' />
                <Input placeholder='numer art.' disabled className='w-28' />
                <Input placeholder='nazwa art.' disabled className='w-32' />
              </div>
              <div className='flex items-center space-x-1'>
                <Button variant='outline' disabled size='icon'>
                  <CopyPlus />
                </Button>

                <Button variant='outline' disabled size='icon'>
                  <RefreshCcw />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-12 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
              <Skeleton className='h-14 w-full'></Skeleton>
            </div>
          </CardContent>
        </Card>
      </main>
    </Container>
  );
}
