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
import { findOvenProcessConfig, insertOvenProcess } from '../actions';
import { addOvenProcessSchema } from '../lib/zod';

export default function AddOvenProcessDialog({}: {}) {
  const [open, setOpen] = useState(false);
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingFindArticle, setIsPendingFindArticle] = useState(false);
  const [findMessage, setFindMessage] = useState('');
  const [foundArticles, setFoundArticles] = useState<{ [key: string]: any }[]>(
    [],
  );
  const [selectedArticle, setSelectedArticle] = useState<
    { [key: string]: any } | undefined
  >(undefined);

  const form = useForm<z.infer<typeof addOvenProcessSchema>>({
    resolver: zodResolver(addOvenProcessSchema),
    defaultValues: {
      findArticle: '',
      article: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        findArticle: '',
        article: '',
      });
      setFindMessage('');
      setFoundArticles([]);
      setSelectedArticle(undefined);
    }
  }, [open]);

  const handleFindArticle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPendingFindArticle(true);
    setSelectedArticle(undefined);
    form.setValue('article', '');
    try {
      const res = await findOvenProcessConfig(e.target.value);
      if ('error' in res) {
        switch (res.error) {
          case 'no articles':
            setFindMessage('Artikel nicht gefunden!');
            setFoundArticles([]);
            setSelectedArticle(undefined);
            break;
          case 'too many articles':
            setFindMessage(
              'Bitte präzisieren Sie Ihre Suche - zu viele Artikel gefunden!',
            );
            setFoundArticles([]);
            setSelectedArticle(undefined);
            break;
          default:
            console.error('handleFindArticle', res.error);
            toast.error('Kontaktieren Sie den IT-Support!');
        }
        return;
      }
      setFindMessage('success');
      setFoundArticles(res.success);
    } catch (error) {
      console.error('handleFindArticle', error);
      toast.error('Kontaktieren Sie den IT-Support!');
    } finally {
      setIsPendingFindArticle(false);
    }
  };

  const onSubmit = async () => {
    setIsPendingInserting(true);
    try {
      if (!selectedArticle) {
        throw new Error('No article selected!');
      }
      const res = await insertOvenProcess(
        selectedArticle as {
          articleNumber: string;
          articleName: string;
          temp: number;
          ovenTime: number;
        },
      );
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
          <DialogTitle>Neuen Prozess hinzufügen</DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[450px]'>
              <div className='grid items-center gap-2 p-2'>
                <FormField
                  control={form.control}
                  name='findArticle'
                  render={({ field }) => (
                    <FormItem className='rounded-lg border p-4'>
                      <FormLabel>Artikel</FormLabel>
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
                            autoComplete='off'
                            onChange={(e) => {
                              field.onChange(e);
                              handleFindArticle(e);
                            }}
                            placeholder={
                              'Geben Sie eine Nummer oder einen Namen ein, um nach einem Artikel zu suchen...'
                            }
                          />
                        </FormControl>
                      </div>
                      {isPendingFindArticle && (
                        <FormMessage>Suche läuft...</FormMessage>
                      )}
                      {findMessage !== 'success' && !isPendingFindArticle && (
                        <FormMessage>{findMessage}</FormMessage>
                      )}
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
                                (article) => article.articleNumber === value,
                              );
                              setSelectedArticle(selectedArticle);
                            }}
                            // defaultValue={field.value}
                            value={field.value}
                            className='flex flex-col space-y-1'
                          >
                            {foundArticles.map((article) => (
                              <FormItem
                                key={article.articleNumber}
                                className='flex items-center space-x-3 space-y-0'
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={article.articleNumber}
                                  />
                                </FormControl>
                                <FormLabel className='font-normal'>
                                  {article.articleNumber} -{' '}
                                  {article.articleName} - {article.temp}°C -{' '}
                                  {article.ovenTime / 60} min
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
