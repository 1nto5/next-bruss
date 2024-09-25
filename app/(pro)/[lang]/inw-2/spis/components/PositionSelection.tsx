'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { newCardSchema as formSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNewCard } from '../actions';

export default function PositionSelection({
  emp,
  positions,
  card,
}: {
  emp: string;
  positions: any[];
  card: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse: undefined,
      sector: undefined,
    },
  });

  const onSubmitNewCard = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await createNewCard(emp, data.warehouse, data.sector);
      if ('error' in res) {
        switch (res.error) {
          case 'persons not found':
            toast.error(
              'Problem z zalogowanymi osobami, zaloguj się ponownie!!',
            );
            break;
          case 'not created':
            toast.error(
              'Nie udało się utworzyć karty! Spróbuj ponownie lub skontaktuj się z IT!',
            );
            break;
          default:
            console.error('onSubmitNewCard', res.error);
            toast.error('Skontaktuj się z IT!');
        }
      } else if (res.success && res.cardNumber) {
        toast.success(`Karta: ${res.cardNumber} utworzona!`);
        router.push(pathname + `/${res.cardNumber}`);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Card className='w-[500px]'>
        <CardHeader>
          <CardTitle>Wybór pozycji</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <Link
                    legacyBehavior
                    key={position.number}
                    href={{
                      pathname: `${pathname}/${position.position.toString()}`,
                    }}
                  >
                    <TableRow>
                      <TableCell>{position.position}</TableCell>
                      <TableCell>{position.identifier}</TableCell>
                      <TableCell>{position.articleNumber}</TableCell>
                      <TableCell>{position.articleName}</TableCell>
                      <TableCell>{`${position.quantity} ${position.unit}`}</TableCell>

                      <TableCell>{position.wip ? 'Tak' : 'Nie'}</TableCell>
                    </TableRow>
                  </Link>
                ))}
              </TableBody>
            </Table>
          }
        </CardContent>
        <CardFooter className='flex justify-end'>
          <Link
            href={{
              pathname: `${pathname}/${positions.length + 1}`,
            }}
          >
            <Button type='submit'>Nowa pozycja</Button>
          </Link>
        </CardFooter>
      </Card>
    </>
  );
}
