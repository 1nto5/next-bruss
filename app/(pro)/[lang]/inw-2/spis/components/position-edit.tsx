'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { positionEditSchema as formSchema } from '../lib/zod';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { findArticles, savePosition } from '../actions';
import { useGetPosition } from '../data/get-position';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';
import ErrorAlert from './error-alert';

export default function PositionEdit() {
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const { card, warehouse, sector } = useCardStore();
  const { setPosition, position } = usePositionStore();

  const persons = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );
  const { data, error, isSuccess, refetch, isFetching } = useGetPosition(
    persons,
    card,
    position,
  );

  const [isPending, setIsPending] = useState(false);
  const [isPendingFindArticle, setIsPendingFindArticle] = useState(false);
  const [foundArticles, setFoundArticles] = useState<{ [key: string]: any }[]>(
    [],
  );
  const [findMessage, setFindMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>();
  const [identifier, setIdentifier] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      findArticle: '', // Use empty string for text inputs
      article: '',
      quantity: '',
      wip: false, // Boolean values can remain as false
      unit: '',
    },
  });

  useEffect(() => {
    const fetchArticles = async () => {
      if (isSuccess && data.success) {
        const res = await findArticles(data.success.articleNumber);
        if (res.success) {
          setFoundArticles(res.success);
          setSelectedArticle(res.success[0]);
          setIdentifier(data?.success.identifier);
          form.setValue('quantity', data?.success.quantity.toString());
          form.setValue('wip', data?.success.wip);
          form.setValue('article', res.success[0].number);
          form.setValue('unit', data?.success.unit);
        }
      }
    };

    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  useEffect(() => {
    setIdentifier('');
    form.setValue('findArticle', '');
    form.setValue('quantity', '');
    form.setValue('wip', false);
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, refetch, card]);

  const handleFindArticle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPendingFindArticle(true);
    setSelectedArticle(undefined);
    form.setValue('article', '');
    form.setValue('quantity', '');
    form.setValue('unit', undefined);
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

  const unit = form.watch('unit');

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await savePosition(
        card,
        position,
        selectedArticle.number,
        selectedArticle.name,
        selectedArticle.converter && data.unit === 'kg'
          ? Math.floor(Number(data.quantity) / selectedArticle.converter)
          : Number(data.quantity),
        selectedArticle.unit,
        data.wip,
        persons,
      );
      if ('error' in res) {
        console.error('onSubmit', res.error);
        toast.error('Skontaktuj się z IT!');
        return;
      }
      if ('success' in res) {
        toast.success('Pozycja zapisana!');
        refetch();
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
    <Card className='w-[500px]'>
      <CardHeader>
        <CardTitle>Pozycja nr: {position}</CardTitle>
        <CardDescription>
          karta nr: {card}, magazyn: {warehouse}, sektor: {sector}, zalogowani:{' '}
          {persons.join(', ')}
        </CardDescription>
      </CardHeader>
      {!isFetching && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <CardContent className='grid w-full items-center gap-4'>
              {identifier && (
                <FormItem className='rounded-lg border p-4'>
                  <FormLabel>Identyfikator</FormLabel>
                  <FormMessage className='text-2xl'>{identifier}</FormMessage>
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
                        {/* <Input
                        className=''
                        placeholder={'wpisz numer lub nazwę aby wyszukać...'}
                        {...field}
                        onChange={(e) => {
                          handleFindArticle(e);
                        }}
                      /> */}
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFindArticle(e);
                          }}
                          placeholder={'wpisz numer lub nazwę aby wyszukać...'}
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
              {foundArticles[0] && !isPendingFindArticle && (
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
                          // defaultValue={field.value}
                          value={field.value}
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
                <FormField
                  control={form.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem className='rounded-lg border p-4'>
                      <FormLabel>Wybierz jednostkę</FormLabel>

                      {/* <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === 'kg') {
                            form.setValue(
                              'quantity',
                              (
                                Number(form.getValues('quantity')) *
                                selectedArticle.converter
                              ).toString(),
                            );
                          } else if (value === 'st') {
                            form.setValue(
                              'quantity',
                              (
                                Number(form.getValues('quantity')) /
                                selectedArticle.converter
                              ).toString(),
                            );
                          }
                        }}
                      > */}
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          const currentQuantity = form.getValues('quantity');
                          if (currentQuantity) {
                            const numericQuantity = Number(currentQuantity);
                            if (value === 'kg') {
                              form.setValue(
                                'quantity',
                                (
                                  numericQuantity * selectedArticle.converter
                                ).toString(),
                              );
                            } else if (value === 'st') {
                              form.setValue(
                                'quantity',
                                (
                                  numericQuantity / selectedArticle.converter
                                ).toString(),
                              );
                            }
                          }
                        }}
                      >
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
                />
              )}

              {selectedArticle && (
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem className='rounded-lg border p-4'>
                      <FormLabel>
                        Ilość wyrażona w{' '}
                        {selectedArticle.converter
                          ? unit
                          : selectedArticle.unit}
                      </FormLabel>
                      {selectedArticle.converter &&
                        form.getValues('unit') === 'kg' && (
                          <FormDescription>
                            {`10 st = ${selectedArticle.converter} kg`}
                          </FormDescription>
                        )}
                      <div className='flex items-center space-x-2'>
                        <FormControl>
                          <Input
                            className=''
                            placeholder={`podaj ilość w ${form.getValues('unit') || selectedArticle.unit}`}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      {isPendingFindArticle && (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      )}
                      {selectedArticle.converter &&
                        form.getValues('unit') === 'kg' &&
                        form.getValues('quantity') && (
                          <FormMessage>
                            ={' '}
                            {Math.floor(
                              Number(form.getValues('quantity')) /
                                selectedArticle.converter,
                            )}{' '}
                            st
                          </FormMessage>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedArticle && sector != 'S900' && (
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
              {position !== 1 ? (
                <Button
                  onClick={() => setPosition(position - 1)}
                  type={'button'}
                  variant={'outline'}
                >
                  - 1
                </Button>
              ) : (
                <Button type={'button'} disabled variant={'outline'}>
                  - 1
                </Button>
              )}
              {isPending ? (
                <Button disabled type={'button'}>
                  <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                  Zapisywanie
                </Button>
              ) : (
                <Button disabled={!selectedArticle || isPending} type='submit'>
                  Zapisz
                </Button>
              )}
              {position !== 25 && data?.success ? (
                <Button
                  onClick={() => setPosition(position + 1)}
                  type={'button'}
                  variant={'outline'}
                >
                  + 1
                </Button>
              ) : (
                <Button type={'button'} disabled variant={'outline'}>
                  + 1
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      )}
      {isFetching && (
        <>
          <CardContent className='g-full grid w-full items-center gap-4'>
            <Skeleton className='h-28'></Skeleton>
            <Skeleton className='h-28'></Skeleton>
            <Skeleton className='h-12'></Skeleton>
            <Skeleton className='h-20'></Skeleton>
            <Skeleton className='h-12'></Skeleton>
          </CardContent>

          {/* <CardFooter className=' flex justify-between'>
            {position !== 1 ? (
              <Button
                onClick={() => setPosition(position - 1)}
                type={'button'}
                variant={'outline'}
              >
                - 1
              </Button>
            ) : (
              <Button type={'button'} disabled variant={'outline'}>
                - 1
              </Button>
            )}
            {isPending ? (
              <Button disabled type={'button'}>
                <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                Zapisywanie
              </Button>
            ) : (
              <Button disabled={!selectedArticle || isPending} type='submit'>
                Zapisz
              </Button>
            )}
            {position !== 25 && data?.success ? (
              <Button
                onClick={() => setPosition(position + 1)}
                type={'button'}
                variant={'outline'}
              >
                + 1
              </Button>
            ) : (
              <Button type={'button'} disabled variant={'outline'}>
                + 1
              </Button>
            )}
          </CardFooter> */}
        </>
      )}
    </Card>
  );
}
