'use client';

import { newCardSchema as formSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
// import { login } from '../actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNewCard } from '../actions';
import { useGetCards } from '../data/get-cards';
import { usePersonalNumberStore } from '../lib/stores';

const warehouseSelectOptions = [
  { value: '000', label: '000 - Produkcja + Magazyn' },
  { value: '035', label: '035 - stal niepowleczona z Chin' },
  { value: '054', label: '054 - magazyn zablokowany JAKOŚĆ' },
  { value: '055', label: '055 - magazyn zablokowany GTM' },
  { value: '111', label: '111 - magazyn LAUNCH' },
  { value: '222', label: '222 - magazyn zablokowany PRODUKCJA' },
  // { value: 999, label: '999 - WIP' },
];

const sectorsSelectOptions = [
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2 Powlekanie + Chemia' },
  { value: 'S3', label: 'S3' },
  { value: 'S4', label: 'S4' },
  { value: 'S5', label: 'S5' },
  { value: 'S6', label: 'S6' },
  { value: 'S7', label: 'S7' },
  { value: 'S8', label: 'S8' },
  { value: 'S9', label: 'S9' },
  { value: 'S10', label: 'S10' },
  { value: 'GUMA', label: 'GUMA' },
  { value: 'Ważenie Baffli', label: 'Ważenie Baffli' },
  { value: 'Las Vegas', label: 'Las Vegas' },
  { value: 'S900', label: 'S900' },
  { value: 'CTM', label: 'CTM' },
  { value: '222', label: '222' },
  { value: '054', label: '054' },
  { value: 'Sedia', label: 'Sedia' },
  { value: 'GTM - Gizycka 9', label: 'GTM - Gizycka 9' },
  { value: 'GTM - Kolejowa', label: 'GTM - Kolejowa' },
];

export default function CardSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const persons = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );
  const { data: cards, error: cardsError, fetchStatus } = useGetCards(persons);

  console.log('fetchStatus', fetchStatus);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse: undefined,
      sector: undefined,
    },
  });

  const emp = '1342';

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
    <Tabs defaultValue='new' className='w-[500px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='new'>Utwórz nową kartę {fetchStatus}</TabsTrigger>
        <TabsTrigger value='exists'>Wybierz istniejącą kartę</TabsTrigger>
      </TabsList>
      <TabsContent value='new'>
        <Card>
          <CardHeader>
            <CardTitle>Nowa karta</CardTitle>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewCard)}>
              <CardContent className='grid w-full items-center gap-4 '>
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
                              className='flex items-center space-x-3 space-y-0'
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
                              className='flex items-center space-x-3 space-y-0'
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
        <Card>
          <CardHeader>
            <CardTitle>Wybór wcześniej utworzonej karty</CardTitle>
          </CardHeader>
          <CardContent className='grid w-full items-center gap-4 '>
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
                {cards?.map((card) => (
                  <Link
                    legacyBehavior
                    key={card.number}
                    href={{
                      pathname: `${pathname}/${card.number.toString()}`,
                    }}
                  >
                    <TableRow>
                      <TableCell>{card.number}</TableCell>
                      <TableCell>
                        {card.positions ? card.positions.length : '0'}
                      </TableCell>
                      <TableCell>{card.warehouse}</TableCell>
                      <TableCell>{card.sector}</TableCell>
                    </TableRow>
                  </Link>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}