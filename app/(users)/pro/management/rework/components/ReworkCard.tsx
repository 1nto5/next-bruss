'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import ReworkTable from './ReworkTable';
import { searchPositions } from '../actions';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';

type Position = {
  article: string;
  status: string;
  workplace: string;
  count: string;
};

export default function ReworkCard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPendingSearching, setIsPendingSearching] = useState(false);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [reason, setReason] = useState('');

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (!searchTerm) {
      setError('Brak wartości do wyszukania!');
      return;
    }
    try {
      setIsPendingSearching(true);
      setPositions(await searchPositions(searchTerm));
      // console.log('search', search);
    } catch (error) {
      console.error('There was an error searcihing:', error);
    } finally {
      setIsPendingSearching(false);
    }
  };

  const markAsRework = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (!searchTerm) {
      setError('Brak wartości do wyszukania!');
      return;
    }
    try {
      setIsPendingSearching(true);
      const search = await searchPositions(searchTerm);
      console.log('search', search);
      if (search.length === 0) {
        setError('Nie znaleziono adnej pozycji!');
      }
      setPositions(search);
      // console.log('search', search);
    } catch (error) {
      console.error('There was an error searcihing:', error);
    } finally {
      setIsPendingSearching(false);
    }
  };

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>Rework </CardTitle>
        {positions.length > 0 && (
          <CardDescription className='font-bold text-bruss'>
            {searchTerm}
          </CardDescription>
        )}
        {!error ? (
          <CardDescription>
            {positions.length === 0
              ? 'Wpisz kod DMC, batch hydra lub paleta by wyszukać i oznaczyć jako rework.'
              : `Sprawdź poprawność wyszukanych pozycji oraz wprowadź powód by oznaczyć jako rework.`}
          </CardDescription>
        ) : (
          <CardDescription className='text-red-700'>{error}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={positions.length > 0 ? markAsRework : search}>
          <div className='grid w-full items-center gap-4'>
            {positions.length === 0 ? (
              // Interfejs do wyszukiwania
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
              // Interfejs po wyszukaniu
              <>
                <ReworkTable data={positions} />
                <Separator />
                <div className='grid w-full gap-1.5'>
                  <Label htmlFor='message'>Powód</Label>
                  <Textarea
                    placeholder='Wprowadź krótki opis reworku.'
                    id='reason'
                    value={reason}
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
                      setError(''); // Dodatkowo czyści błąd
                    }}
                  >
                    Wyczyść
                  </Button>
                  <Button type='submit'>Oznacz jako rework</Button>
                </div>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
