'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zodResolver } from '@hookform/resolvers/zod';

import { Hourglass, Plus } from 'lucide-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { insertOvenProcess } from '../actions';
import { useGetOvenConfigs } from '../data/get-oven-configs';
import { addOvenProcessSchema } from '../lib/zod';

export default function AddOvenProcessDialog({}: {}) {
  const [open, setOpen] = useState(false);
  const [isPendingInsert, setIsPendingInserting] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<
    { [key: string]: any } | undefined
  >(undefined);

  const form = useForm<z.infer<typeof addOvenProcessSchema>>({
    resolver: zodResolver(addOvenProcessSchema),
    defaultValues: {
      configFiltr: '',
      article: '',
      ovenNumber: undefined,
    },
  });
  const ovenNumber = form.watch('ovenNumber');
  const configFiltr = form.watch('configFiltr');

  const {
    data: ovenConfigs,
    error,
    refetch: refetchOvenConfigs,
    isFetching: isFetchingOvenConfigs,
  } = useGetOvenConfigs(configFiltr || '', open);

  useEffect(() => {
    if (open) {
      form.reset({
        configFiltr: '',
        article: '',
        ovenNumber: undefined,
      });
      setSelectedArticle(undefined);
    }
  }, [open]);

  const onSubmit = async () => {
    setIsPendingInserting(true);
    try {
      if (!selectedArticle) {
        return;
      }

      const ovenProcessData = {
        articleNumber: selectedArticle.articleNumber,
        articleName: selectedArticle.articleName,
        temp: selectedArticle.temp,
        ovenTime: selectedArticle.ovenTime,
        ovenNumber: Number(ovenNumber),
        operators: [''],
      };

      const res = await insertOvenProcess(ovenProcessData);
      if (res.success) {
        toast.success('Fehler hinzugefügt!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Kontaktieren Sie den IT-Support!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Kontaktieren Sie den IT-Support!');
    } finally {
      setIsPendingInserting(false);
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Plus /> <span>Prozess hinzufügen</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[700px] sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>
            Neuen Prozess hinzufügen{' '}
            {ovenNumber && `für Ofennummer: ${ovenNumber}`}
          </DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[70vh]'>
              <div className='mr-4 grid items-center gap-2'>
                {!ovenNumber && (
                  <FormField
                    control={form.control}
                    name='ovenNumber'
                    render={({ field }) => (
                      <FormItem className='space-y-3 rounded-lg border p-4'>
                        <FormLabel>Ofen auswählen</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                            className='flex flex-col space-y-2'
                          >
                            {Array.from({ length: 7 }, (_, i) => (
                              <FormItem
                                key={i + 1}
                                className='flex items-center space-x-3 space-y-0'
                              >
                                <FormControl>
                                  <RadioGroupItem value={(i + 1).toString()} />
                                </FormControl>
                                <FormLabel className='font-normal'>
                                  Oven {i + 1}
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
                {ovenNumber && (
                  <>
                    <FormField
                      control={form.control}
                      name='configFiltr'
                      render={({ field }) => (
                        <FormItem className='rounded-lg border p-4'>
                          <FormLabel>Suche nach Artikel</FormLabel>
                          <div className='flex items-center space-x-2'>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ''}
                                autoComplete='off'
                                autoFocus
                                onChange={(e) => {
                                  field.onChange(e);
                                  refetchOvenConfigs();
                                }}
                                placeholder={
                                  'Geben Sie eine Nummer oder einen Namen ein, um nach einem Artikel zu suchen...'
                                }
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='article'
                      render={({ field }) => (
                        <FormItem className='space-y-3 rounded-lg border p-4'>
                          {/* <FormLabel>Artikel auswählen</FormLabel> */}

                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selectedArticle = (
                                  ovenConfigs || []
                                ).find(
                                  (article) => article.articleNumber === value,
                                );
                                setSelectedArticle(selectedArticle);
                              }}
                              // defaultValue={field.value}
                              value={field.value}
                              className='flex flex-col space-y-2'
                            >
                              {(ovenConfigs ?? []).map((config) => (
                                <FormItem
                                  key={config.articleNumber}
                                  className='flex items-center space-x-3 space-y-0'
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={config.articleNumber}
                                    />
                                  </FormControl>
                                  <FormLabel className='font-normal'>
                                    {config.articleNumber} -{' '}
                                    {config.articleName} - {config.temp}°C -{' '}
                                    {config.ovenTime / 60} min
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className='mt-4'>
              {isPendingInsert ? (
                <Button className='w-full' disabled>
                  <Hourglass className='animate-spin' />
                  Prozess starten
                </Button>
              ) : (
                <Button className='w-full' type='submit'>
                  <Hourglass />
                  Prozess starten
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
