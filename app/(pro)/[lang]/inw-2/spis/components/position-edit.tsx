'use client';

import { positionEditSchema as formSchema } from '@/lib/z/inventory';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { set } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { findArticles, savePosition } from '../actions';

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
  const [isPendingFindArticle, setIsPendingFindArticle] = useState(false);
  const [foundArticles, setFoundArticles] = useState<{ [key: string]: any }[]>(
    [],
  );
  const [findMessage, setFindMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>();
  const [selectedUnit, setSelectedUnit] = useState('');
  const [identifier, setIdentifier] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      findArticle: undefined,
      article: positionData?.articleNumber || undefined,
      quantity: positionData?.quantity || undefined,
      wip: positionData?.wip || false,
    },
  });

  const handleFindArticle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPendingFindArticle(true);
    try {
      const res = await findArticles(e.target.value);
      if ('error' in res) {
        switch (res.error) {
          case 'no articles':
            setFindMessage('Nie znaleziono artykułu!');
            setFoundArticles([]);
            setSelectedArticle(undefined);
            break;
          case 'too many articles':
            setFindMessage(
              'Sprecyzuj wyszukiwanie - znaleziono za dużo artykułów!',
            );
            setFoundArticles([]);
            setSelectedArticle(undefined);
            break;
          default:
            console.error('handleFindArticle', res.error);
            toast.error('Skontaktuj się z IT!');
        }
        return;
      }
      setFindMessage('success');
      setFoundArticles(res.success);
    } catch (error) {
      console.error('handleFindArticle', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingFindArticle(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      console.log(cardInfo.creators);
      const res = await savePosition(
        cardInfo.number,
        Number(positionNumber),
        selectedArticle.number,
        selectedArticle.name,
        Number(data.quantity),
        selectedUnit || selectedArticle.unit,
        data.wip,
        cardInfo.creators,
      );
      if ('error' in res) {
        console.error('onSubmit', res.error);
        toast.error('Skontaktuj się z IT!');
        return;
      }
      if ('success' in res) {
        toast.success('Pozycja zapisana!');
        setIdentifier(res.identifier);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
      form.reset();
    }
  };
  return (
    <>
      <Card className='w-[500px]'>
        <CardHeader>
          <CardTitle>Edycja pozycji nr: {positionNumber}</CardTitle>
          <CardDescription>
            Numer karty: {cardInfo.number}, magazyn: {cardInfo.warehouse},
            sektor: {cardInfo.sector}, inwentaryzujący: {cardInfo.creators[0]} i{' '}
            {cardInfo.creators[1]}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <CardContent className='grid w-full items-center gap-4 '>
              {identifier && (
                <FormItem className='rounded-lg border p-4'>
                  <FormLabel>Identyfikator</FormLabel>
                  <FormMessage>{identifier}</FormMessage>
                </FormItem>
              )}
              <FormField
                control={form.control}
                name='findArticle'
                render={({ field }) => (
                  <FormItem className='rounded-lg border p-4'>
                    <FormLabel>Artykuł</FormLabel>
                    <div className='flex items-center space-x-2'>
                      <FormControl>
                        <Input
                          className=''
                          placeholder='wpisz numer lub nazwę aby wyszukać...'
                          {...field}
                          onChange={(e) => {
                            handleFindArticle(e);
                          }}
                        />
                      </FormControl>
                    </div>
                    {isPendingFindArticle && (
                      <FormMessage>Wyszukiwanie...</FormMessage>
                    )}
                    {findMessage !== 'success' && !isPendingFindArticle && (
                      <FormMessage>{findMessage}</FormMessage>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {findMessage === 'success' && !isPendingFindArticle && (
                <FormField
                  control={form.control}
                  name='article'
                  render={({ field }) => (
                    <FormItem className='space-y-3 rounded-lg border p-4'>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedArticle = foundArticles.find(
                              (article) => article.number === value,
                            );
                            setSelectedArticle(selectedArticle);
                          }}
                          defaultValue={field.value}
                          className='flex flex-col space-y-1'
                        >
                          {foundArticles.map((article) => (
                            <FormItem
                              key={article.number}
                              className='flex items-center space-x-3 space-y-0'
                            >
                              <FormControl>
                                <RadioGroupItem value={article.number} />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {article.number} - {article.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedArticle?.converter && (
                <FormItem className='rounded-lg border p-4'>
                  <FormLabel>Wybierz jednostkę</FormLabel>

                  <RadioGroup onValueChange={(value) => setSelectedUnit(value)}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='kg' id='r2' />
                      <Label htmlFor='kg'>kg</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='st' id='r3' />
                      <Label htmlFor='st'>st</Label>
                    </div>
                  </RadioGroup>
                </FormItem>
              )}

              {selectedArticle && (
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem className='rounded-lg border p-4'>
                      <FormLabel>Ilość</FormLabel>
                      {selectedArticle.converter && selectedUnit === 'kg' && (
                        <FormDescription>
                          {`10 st = ${selectedArticle.converter} kg`}
                        </FormDescription>
                      )}
                      <div className='flex items-center space-x-2'>
                        <FormControl>
                          <Input
                            type='number'
                            className=''
                            placeholder={`podaj ilość w ${selectedUnit || selectedArticle.unit}`}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      {isPendingFindArticle && (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      )}
                      {selectedArticle.converter &&
                        selectedUnit === 'kg' &&
                        form.getValues('quantity') && (
                          <FormMessage>
                            ={' '}
                            {Number(form.getValues('quantity')) /
                              selectedArticle.converter}{' '}
                            st
                          </FormMessage>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedArticle && cardInfo.sector !== 'S900' && (
                <FormField
                  control={form.control}
                  name='wip'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>WIP</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
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
              <Button disabled={!selectedArticle} type='submit'>
                Zapisz
              </Button>
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
