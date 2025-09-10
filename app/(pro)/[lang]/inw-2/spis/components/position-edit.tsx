'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { findArticles, findBins, savePosition } from '../actions';
import { useGetPosition } from '../data/get-position';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from '../lib/stores';
import { positionEditSchema as formSchema } from '../lib/zod';
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
  const [isPendingFindBin, setIsPendingFindBin] = useState(false);
  const [foundArticles, setFoundArticles] = useState<{ [key: string]: any }[]>(
    [],
  );
  const [foundBins, setFoundBins] = useState<{ [key: string]: any }[]>([]);
  const [findArticleMessage, setFindArticleMessage] = useState('');
  const [findBinMessage, setFindBinMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>();
  const [selectedBin, setSelectedBin] = useState<any>();
  const [identifier, setIdentifier] = useState('');
  const [showPlusOneMessage, setShowPlusOneMessage] = useState(false);
  useEffect(() => {
    if (isSuccess && !data?.success?.identifier) {
      setIdentifier('');
    }
  }, [isSuccess, data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      findArticle: '',
      article: '',
      quantity: '',
      wip: false,
      unit: '',
      deliveryDate: undefined,
    },
  });

  useEffect(() => {
    const fetchArticles = async () => {
      if (isSuccess && data.success) {
        const res = await findArticles(data.success.articleNumber);
        if (res.success) {
          setShowPlusOneMessage(false);
          setFoundArticles(res.success);
          setSelectedArticle(res.success[0]);
          setIdentifier(data?.success.identifier);
          form.setValue('quantity', data?.success.quantity.toString());
          form.setValue('wip', data?.success.wip);
          form.setValue('article', res.success[0].number);
          form.setValue('unit', data?.success.unit);
          // Set delivery date if it exists in data
          if (data?.success.deliveryDate) {
            form.setValue('deliveryDate', new Date(data.success.deliveryDate));
          }

          // Fix for storage bin display - fetch bin data if available
          if (data.success.bin && data.success.bin.trim() !== '') {
            const binRes = await findBins(data.success.bin);
            if (binRes.success && binRes.success.length > 0) {
              setFoundBins(binRes.success);
              // Set the selected bin to the matching bin object
              const matchingBin = binRes.success.find(
                (bin) => bin.value === data.success.bin,
              );
              setSelectedBin(matchingBin || binRes.success[0]);
              setFindBinMessage('success');
            }
            form.setValue('bin', data.success.bin);
          }
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
    // form.setValue('unit', '');
    form.setValue('findBin', '');
    // form.setValue('deliveryDate', undefined);
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
            setFindArticleMessage('Nie znaleziono artykułu!');
            setFoundArticles([]);
            setSelectedArticle(undefined);
            break;
          case 'too many articles':
            setFindArticleMessage(
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
      setFindArticleMessage('success');
      setFoundArticles(res.success);
    } catch (error) {
      console.error('handleFindArticle', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingFindArticle(false);
    }
  };

  const handleFindBin = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPendingFindBin(true);
    try {
      const res = await findBins(e.target.value);
      if ('error' in res) {
        switch (res.error) {
          case 'no bins':
            setFindBinMessage('Nie znaleziono pasującej pozycji!');
            setFoundBins([]);
            setSelectedBin(undefined);
            break;
          case 'too many bins':
            setFindBinMessage('Sprecyzuj wyszukiwanie - zbyt wiele wyników!');
            setFoundBins([]);
            setSelectedBin(undefined);
            break;
          default:
            console.error('handleFindBin', res.error);
            toast.error('Skontaktuj się z IT!');
        }
        return;
      }
      setFindBinMessage('success');
      setFoundBins(res.success);
    } catch (error) {
      console.error('handleFindBin', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingFindBin(false);
    }
  };

  const clearForm = () => {
    // Reset form fields
    form.setValue('findArticle', '');
    form.setValue('article', '');
    form.setValue('quantity', '');
    form.setValue('wip', false);
    form.setValue('unit', '');
    form.setValue('findBin', '');
    form.setValue('bin', '');
    form.setValue('deliveryDate', undefined);

    // Reset states
    setSelectedArticle(undefined);
    setSelectedBin(undefined);
    setFoundArticles([]);
    setFoundBins([]);
    setIdentifier('');
    setFindArticleMessage('');
    setFindBinMessage('');
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
        selectedBin && selectedBin.value,
        data.deliveryDate,
      );
      if ('error' in res) {
        if (res.error === 'wrong quantity') {
          form.setError('quantity', {
            message: 'Niepoprawna wartość!',
          });
          return;
        }
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

  if (isFetching) {
    return (
      <Card className='sm:w-[600px]'>
        <CardHeader>
          <CardTitle>Pozycja nr: {position}</CardTitle>
          <CardDescription>
            karta nr: {card}, magazyn: {warehouse}, sektor: {sector},
            zalogowani: {persons.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent className='g-full grid w-full items-center gap-4'>
          <Skeleton className='h-28'></Skeleton>
          <Skeleton className='h-28'></Skeleton>
          <Skeleton className='h-12'></Skeleton>
          <Skeleton className='h-20'></Skeleton>
          <Skeleton className='h-12'></Skeleton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='sm:w-[600px]'>
      <CardHeader>
        <CardTitle>Pozycja nr: {position}</CardTitle>
        <CardDescription>
          karta nr: {card}, magazyn: {warehouse}, sektor: {sector}, zalogowani:{' '}
          {persons.join(', ')}
          {data?.success?.approver &&
            ', pozycja zatwierdzona - edycja niedozwolona'}
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
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={data?.success?.approver}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFindArticle(e);
                            setShowPlusOneMessage(false);
                          }}
                          placeholder={'wpisz numer lub nazwę aby wyszukać...'}
                        />
                      </FormControl>
                    </div>
                    {isPendingFindArticle && (
                      <FormMessage>Wyszukiwanie...</FormMessage>
                    )}
                    {findArticleMessage !== 'success' &&
                      !isPendingFindArticle && (
                        <FormMessage>{findArticleMessage}</FormMessage>
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
                          disabled={data?.success?.approver}
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
                              className='flex items-center space-y-0 space-x-3'
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
                      {showPlusOneMessage && (
                        <FormMessage className=''>
                          Artykuł zapisany z poprzedniej pozycji - zweryfikuj
                          jego poprawność!
                        </FormMessage>
                      )}
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
                            disabled={data?.success?.approver}
                            placeholder={`podaj ilość w ${form.getValues('unit') || selectedArticle.unit}`}
                            inputMode='decimal'
                            {...field}
                            onChange={(e) => {
                              // Handle comma to period conversion locally for display
                              const value = e.target.value.replace(/,/g, '.');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                      </div>
                      {isPendingFindArticle && (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      )}
                      {selectedArticle.converter &&
                        form.getValues('unit') === 'kg' &&
                        form.getValues('quantity') && (
                          <FormDescription>
                            ={' '}
                            {Math.floor(
                              Number(
                                form.getValues('quantity').replace(/,/g, '.'),
                              ) / selectedArticle.converter || 0,
                            )}{' '}
                            st
                          </FormDescription>
                        )}
                      <FormMessage />
                      {/* FIX: double FormMessage */}
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
                          disabled={data?.success?.approver}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {selectedArticle && (
                <Accordion type='single' collapsible>
                  <AccordionItem value='storage-delivery'>
                    <AccordionTrigger>
                      Storage Bin i Data Dostawy
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className='space-y-4 pt-2'>
                        <FormField
                          control={form.control}
                          name='findBin'
                          render={({ field }) => (
                            <FormItem className='rounded-lg border p-4'>
                              <FormLabel>Storage Bin</FormLabel>

                              <div className='flex items-center space-x-2'>
                                <FormControl>
                                  <Input
                                    className=''
                                    placeholder={'wpisz aby wyszukać...'}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleFindBin(e);
                                    }}
                                  />
                                </FormControl>
                              </div>
                              {isPendingFindBin && (
                                <FormMessage>Wyszukiwanie...</FormMessage>
                              )}
                              {findBinMessage !== 'success' &&
                                !isPendingFindBin && (
                                  <FormMessage>{findBinMessage}</FormMessage>
                                )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {foundBins[0] && !isPendingFindBin && (
                          <FormField
                            control={form.control}
                            name='bin'
                            render={({ field }) => (
                              <FormItem className='space-y-3 rounded-lg border p-4'>
                                <FormControl>
                                  <RadioGroup
                                    disabled={data?.success?.approver}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      const selectedBin = foundBins.find(
                                        (bin) => bin.value === value,
                                      );
                                      setFindBinMessage('success');
                                      setSelectedBin(selectedBin);
                                    }}
                                    value={field.value}
                                    className='flex flex-col space-y-1'
                                  >
                                    {foundBins.map((bin) => (
                                      <FormItem
                                        key={bin.value}
                                        className='flex items-center space-y-0 space-x-3'
                                      >
                                        <FormControl>
                                          <RadioGroupItem value={bin.value} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>
                                          {bin.label}
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

                        <FormField
                          control={form.control}
                          name='deliveryDate'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data dostawy</FormLabel>

                              <FormControl>
                                <DateTimePicker
                                  modal
                                  hideTime
                                  value={field.value}
                                  onChange={field.onChange}
                                  renderTrigger={({ open, value, setOpen }) => (
                                    <DateTimeInput
                                      value={value}
                                      onChange={(x) =>
                                        !open && field.onChange(x)
                                      }
                                      format='dd/MM/yyyy'
                                      disabled={open}
                                      onCalendarClick={() => setOpen(!open)}
                                    />
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>

            <CardFooter className='flex justify-between gap-2'>
              {position !== 1 ? (
                <Button
                  onClick={() => {
                    setPosition(position - 1);
                    setShowPlusOneMessage(false);
                  }}
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
              <div className='grid w-full grid-cols-2 gap-2'>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={clearForm}
                  disabled={isPending || data?.success?.approver}
                  className='w-full'
                >
                  Wyczyść
                </Button>
                <Button
                  disabled={
                    !selectedArticle || isPending || data?.success?.approver
                  }
                  type='submit'
                  className='w-full'
                >
                  {isPending ? <Loader2 className='animate-spin' /> : <RefreshCcw />}
                  Zapisz
                </Button>
              </div>
              {position !== 25 && data?.success ? (
                <Button
                  onClick={() => {
                    setPosition(position + 1);
                    setShowPlusOneMessage(true);
                  }}
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
            <Button disabled={!selectedArticle || isPending} type='submit'>
              {isPending ? <Loader2 className='animate-spin' /> : <RefreshCcw />}
              Zapisz
            </Button>
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
