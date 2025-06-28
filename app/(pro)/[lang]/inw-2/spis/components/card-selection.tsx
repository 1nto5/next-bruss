'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { newCardSchema as formSchema } from '../lib/zod';
// import { login } from '../actions';
import {
  sectorsSelectOptions,
  warehouseSelectOptions,
} from '@/app/(pro)/[lang]/inw-2/spis/lib/options';
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
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CardType } from '../../../../../(mgmt)/[lang]/inw-2/zatwierdz/lib/types';
import { createNewCard } from '../actions';
import { useGetCards } from '../data/get-cards';
import { useCardStore, usePersonalNumberStore } from '../lib/stores';
import ErrorAlert from './error-alert';

export default function CardSelection() {
  const [isPending, setIsPending] = useState(false);
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const { setCard } = useCardStore();
  const persons = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );
  const { data, error, refetch, isFetching } = useGetCards(persons);

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
      const res = await createNewCard(persons, data.warehouse, data.sector);
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
        setCard(res.cardNumber, data.warehouse, data.sector);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  if (data?.error || error) {
    console.error(data?.error || error);
    return <ErrorAlert refetch={refetch} isFetching={isFetching} />;
  }

  return (
    <Tabs defaultValue='new' className='sm:w-[600px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='new'>Utwórz nową kartę</TabsTrigger>
        <TabsTrigger value='exists'>Wybierz istniejącą kartę</TabsTrigger>
      </TabsList>
      <TabsContent value='new'>
        <Card>
          <CardHeader>
            <CardTitle>Nowa karta</CardTitle>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewCard)}>
              <CardContent className='grid w-full items-center gap-4'>
                <FormField
                  control={form.control}
                  name='warehouse'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel>Magazyn</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='flex flex-col space-y-1'
                        >
                          {warehouseSelectOptions.map((warehouse) => (
                            <FormItem
                              key={warehouse.value}
                              className='flex items-center space-y-0 space-x-3'
                            >
                              <FormControl>
                                <RadioGroupItem value={warehouse.value} />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {warehouse.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='sector'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel>Sektor</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='flex flex-col space-y-1'
                        >
                          {sectorsSelectOptions.map((sector) => (
                            <FormItem
                              key={sector.value}
                              className='flex items-center space-y-0 space-x-3'
                            >
                              <FormControl>
                                <RadioGroupItem value={sector.value} />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {sector.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className='flex justify-end'>
                {isPending ? (
                  <Button disabled>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Tworzę kartę
                  </Button>
                ) : (
                  <Button type='submit'>Utwórz kartę</Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
      <TabsContent value='exists'>
        {data?.success ? (
          <Card>
            <CardHeader>
              <CardTitle className={clsx('', isFetching && 'animate-pulse')}>
                Wybór wcześniej utworzonej karty
              </CardTitle>
              <CardDescription>
                Tylko karty gdzie autorem jest jedna z zalogowanych osób.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid w-full items-center gap-4'>
              <Table>
                {/* <TableCaption>A list of instruments.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer</TableHead>
                    <TableHead>Liczba pozycji</TableHead>
                    <TableHead>Magazyn</TableHead>
                    <TableHead>Sektor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.success as CardType[]).map((card: CardType) => (
                    <TableRow
                      key={card.number}
                      onClick={() => {
                        setCard(card.number, card.warehouse, card.sector);
                      }}
                    >
                      <TableCell>{card.number}</TableCell>
                      <TableCell>
                        {card.positions ? card.positions.length : '0'}
                      </TableCell>
                      <TableCell>{card.warehouse}</TableCell>
                      <TableCell>{card.sector}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          data?.message === 'no cards' && (
            <Card>
              <CardHeader>
                <CardTitle>Nie znaleziono istniejących kart</CardTitle>
                <CardDescription>
                  Utwórz nową kartę, aby rozpocząć!
                </CardDescription>
              </CardHeader>
            </Card>
          )
        )}
        {isFetching && !data?.success && (
          <Card>
            <CardHeader>
              <CardTitle>Wybór wcześniej utworzonej karty</CardTitle>
              <CardDescription>
                Tylko karty gdzie autorem jest jedna z zalogowanych osób.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid w-full items-center gap-4'>
              <Skeleton>
                <Table>
                  {/* <TableCaption>A list of instruments.</TableCaption> */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numer</TableHead>
                      <TableHead>Liczba pozycji</TableHead>
                      <TableHead>Magazyn</TableHead>
                      <TableHead>Sektor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Skeleton>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
