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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import clsx from 'clsx';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useGetCardPositions } from '../data/get-positions';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';
import { PositionType } from '../lib/types';

export default function PositionSelection() {
  // const [isPending, setIsPending] = useState(false);
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const { card } = useCardStore();
  const { setPosition } = usePositionStore();

  const persons = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );
  const { data, error, fetchStatus, isSuccess } = useGetCardPositions(
    persons,
    card,
  );

  useEffect(() => {
    if (isSuccess && data.message === 'no positions') {
      setPosition(1);
    }
  }, [data?.message, isSuccess, setPosition]);

  // useEffect(() => {
  //   if (data?.error || error) {
  //     console.error('useGetCards error:', data?.error || error);
  //     toast.error('Problem z pobraniem kart! Skontaktuj się z IT!');
  //   }
  // }, [data, error]);

  if (data?.error || error) {
    throw new Error(`useGetCardPositions error: ${data?.error || error}`);
  }

  return (
    <Card className='w-[700px]'>
      <CardHeader>
        <CardTitle
          className={clsx('', fetchStatus === 'fetching' && 'animate-pulse')}
        >
          Wybór pozycji
        </CardTitle>
        <CardDescription>Numer karty: {card}</CardDescription>
      </CardHeader>
      <CardContent className='grid w-full items-center gap-4 '>
        {
          <Table>
            {/* <TableCaption>A list of instruments.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Numer</TableHead>
                <TableHead>Identyfikator</TableHead>
                <TableHead>Numer art.</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>WIP</TableHead>
                {/* TODO: uruchomić jak dodasz nowe pozycje z creators */}
                {/* <TableHead>Utworzył</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.success.map((position: PositionType) => (
                <TableRow
                  key={position.position}
                  onClick={() => {
                    setPosition(position.position);
                    toast.success(`Pozycja: ${position.position} wybrana!`);
                  }}
                >
                  <TableCell>{position.position}</TableCell>
                  <TableCell>{position.identifier}</TableCell>
                  <TableCell>{position.articleNumber}</TableCell>
                  <TableCell>{position.articleName}</TableCell>
                  <TableCell>{`${position.quantity} ${position.unit}`}</TableCell>
                  <TableCell>{position.wip ? 'Tak' : 'Nie'}</TableCell>
                  {/* <TableCell>{position.creators.join(', ')}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      </CardContent>
      {data?.success.length < 25 && (
        <CardFooter className='flex justify-end'>
          {/* TODO: onClick new position */}
          <Button>Nowa pozycja</Button>
        </CardFooter>
      )}
    </Card>
  );
}
