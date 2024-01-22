'use client';

import { useState } from 'react';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {} from '../actions';

const formSchema = z.object({
  articleNumber: z
    .string()
    .length(5, { message: 'Article number must be exactly 5 digits!' })
    .regex(/^[0-9]{5}$/, {
      message: 'Article number must be numeric!',
    }),
});

export default function AddArticleConfig({ dict }: any) {
  const [isPendingSearching, setIsPendingSearching] = useState(false);
  const [error, setError] = useState('');
  const [isPendingSetting, setIsPendingSetting] = useState(false);
  const [updated, setUpdated] = useState(0);
  const [openArticle, setOpenArticle] = useState(false);

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>{dict?.articleConfig?.add.cardTitle}</CardTitle>
        {!error ? (
          <CardDescription>
            {dict?.articleConfig?.add.cardDescription}
          </CardDescription>
        ) : (
          <CardDescription className='text-red-700'>{error}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {/* <form onSubmit={positions.length > 0 ? markAsRework : search}>
          <div className='grid w-full items-center gap-4'>
            {positions.length === 0 ? (
              <>
                <div className='flex flex-col space-y-1.5'>
                  <Label htmlFor='input'>DMC / batch hydra / paleta</Label>
                  <Input
                    type='text'
                    placeholder='Wpisz dowolny...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className='flex justify-center'>
                  {isPendingSearching ? (
                    <Button disabled>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Szukanie
                    </Button>
                  ) : (
                    <Button type='submit'>Wyszukaj</Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <ReworkTable data={positions} />
                <Separator />
                <div className='grid w-full gap-1.5'>
                  <Label htmlFor='message'>Powód</Label>
                  <Textarea
                    placeholder='Wprowadź krótki opis reworku.'
                    id='reason'
                    value={reason}
                    className={reason.length >= 20 ? 'border-bruss' : ''}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className='flex justify-between'>
                  <Button
                    variant='destructive'
                    type='button'
                    onClick={() => {
                      setPositions([]);
                      setReason('');
                      setSearchTerm('');
                      setError('');
                      setUpdated(0);
                    }}
                  >
                    Wyczyść
                  </Button>
                  {isPendingSetting ? (
                    <Button disabled>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Zapisywanie
                    </Button>
                  ) : (
                    <Button type='submit'>Oznacz jako rework</Button>
                  )}
                </div>
              </>
            )}
          </div>
        </form> */}
      </CardContent>
      {updated > 0 && (
        <CardFooter className='font-bold text-bruss'>
          Zaktualizowano pozycji: {updated}!
        </CardFooter>
      )}
    </Card>
  );
}
