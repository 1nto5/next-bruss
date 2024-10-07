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
import { Skeleton } from '@/components/ui/skeleton';
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
import { useGetCardPositions } from '../data/get-card-positions';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';
import { PositionType } from '../lib/types';
import ErrorAlert from './error-alert';

export default function PositionSelection() {
  // const [isPending, setIsPending] = useState(false);
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const { card } = useCardStore();
  const { setPosition } = usePositionStore();

  const persons = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );
  const { data, error, isSuccess, refetch, isFetching } = useGetCardPositions(
    persons,
    card,
  );

  useEffect(() => {
    if (isSuccess && data.message === 'no positions') {
      setPosition(1);
    }
  }, [data?.message, isSuccess, setPosition]);

  if (data?.error || error) {
    return <ErrorAlert refetch={refetch} isFetching={isFetching} />;
  }

  return (
    <Card className='w-[700px]'>
      <CardHeader>
        <CardTitle className={clsx('', isFetching && 'animate-pulse')}>
          Wybór pozycji
        </CardTitle>
        <CardDescription>Numer karty: {card}</CardDescription>
      </CardHeader>
      <CardContent className='grid w-full items-center gap-4 '>
        {data?.success && (
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
              {data.success.map((position: PositionType) => (
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
        )}
        {isFetching && !data?.success && (
          <Skeleton>
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
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    {/* <TableCell>{position.creators.join(', ')}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Skeleton>
        )}
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
