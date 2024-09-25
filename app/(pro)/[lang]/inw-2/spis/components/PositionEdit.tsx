'use client';

import { savePositionSchema as formSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
// import { login } from '../actions';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNewCard } from '../actions';

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const;

export default function PositionEdit({
  cardInfo,
  positionData,
  positionNumber,
}: {
  cardInfo: any;
  positionData: any;
  positionNumber: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      article: positionData?.articleNumber || undefined,
      quantity: positionData?.quantity || undefined,
      wip: positionData?.wip || false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    toast.error('Problem z zalogowanymi osobami, zaloguj się ponownie!!');
    // try {
    //   const res = await createNewCard(emp, data.warehouse, data.sector);
    //   if ('error' in res) {
    //     switch (res.error) {
    //       case 'persons not found':
    //         toast.error(
    //           'Problem z zalogowanymi osobami, zaloguj się ponownie!!',
    //         );
    //         break;
    //       case 'not created':
    //         toast.error(
    //           'Nie udało się utworzyć karty! Spróbuj ponownie lub skontaktuj się z IT!',
    //         );
    //         break;
    //       default:
    //         console.error('onSubmitNewCard', res.error);
    //         toast.error('Skontaktuj się z IT!');
    //     }
    //   } else if (res.success && res.cardNumber) {
    //     toast.success(`Karta: ${res.cardNumber} utworzona!`);
    //     router.push(pathname + `/${res.cardNumber}`);
    //   }
    // } catch (error) {
    //   console.error('onSubmit', error);
    //   toast.error('Skontaktuj się z IT!');
    // } finally {
    //   setIsPending(false);
    // }
  };
  return (
    <>
      <Card className='w-[500px]'>
        <CardHeader>
          <CardTitle>Edycja pozycji: {positionNumber}</CardTitle>
          <CardDescription>
            Numer karty: {cardInfo.number}, magazyn: {cardInfo.warehouse},
            sektor: {cardInfo.sector}, inwentaryzujący: {cardInfo.creators[0]} i{' '}
            {cardInfo.creators[1]}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <CardContent className='grid w-full items-center gap-4 '>
              <FormField
                control={form.control}
                name='article'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Artykuł</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? languages.find(
                                  (language) => language.value === field.value,
                                )?.label
                              : 'Wybierz artykuł'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='p-0'>
                        <Command>
                          <CommandInput placeholder='Szukaj artykuł...' />
                          <CommandList>
                            <CommandEmpty>Nie znaleziono.</CommandEmpty>
                            <CommandGroup>
                              {languages.map((language) => (
                                <CommandItem
                                  value={language.label}
                                  key={language.value}
                                  onSelect={() => {
                                    form.setValue('article', language.value);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      language.value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {language.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className='flex justify-between'>
              {Number(positionNumber) !== 1 ? (
                <Link
                  href={{
                    pathname: pathname.replace(
                      /\/[^\/]+$/,
                      `/${Number(positionNumber) - 1}`,
                    ),
                  }}
                >
                  <Button variant={'outline'}>- 1</Button>
                </Link>
              ) : (
                <Button disabled variant={'outline'}>
                  - 1
                </Button>
              )}
              <Button type='submit'>Zapisz</Button>
              {Number(positionNumber) !== 25 && positionData ? (
                <Link
                  href={{
                    pathname: pathname.replace(
                      /\/[^\/]+$/,
                      `/${Number(positionNumber) + 1}`,
                    ),
                  }}
                >
                  <Button variant={'outline'}>+ 1</Button>
                </Link>
              ) : (
                <Button disabled variant={'outline'}>
                  + 1
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
