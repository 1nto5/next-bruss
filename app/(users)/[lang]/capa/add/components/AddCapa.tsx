'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import NoAvailable from '../../../components/NoAvailable';
// import { saveArticleConfig } from '../actions';
// import { useQuery } from '@tanstack/react-query';

export default function AddCapa() {
  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z.object({
    client: z.string().min(2, { message: 'Pole jest wymagane!' }),
    line: z.string().min(3, { message: 'Pole jest wymagane!' }),
    articleNumber: z.string().min(5, { message: 'Pole jest wymagane!' }),
    articleName: z.string().min(3, { message: 'Pole jest wymagane!' }),
    clientPartNumber: z.string().min(3, { message: 'Pole jest wymagane!' }),
    piff: z.string().min(3, { message: 'Pole jest wymagane!' }),
    processDescription: z.string().min(5, { message: 'Pole jest wymagane!' }),
    rep160t: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep260t: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep260t2k: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep300t: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep300t2k: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep400t: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    rep500t: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    b50: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    b85: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    engel: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    eol: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    cutter: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    other: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    soldCapa: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    flex: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    possibleMax: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    comment: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    sop: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    eop: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
    service: z.string().min(3, { message: 'Minimum 3 znaki!' }).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: '',
      line: '',
      articleNumber: '',
      articleName: '',
      clientPartNumber: '',
      piff: '',
      processDescription: '',
      rep160t: '',
      rep260t: '',
      rep260t2k: '',
      rep300t: '',
      rep300t2k: '',
      rep400t: '',
      rep500t: '',
      b50: '',
      b85: '',
      engel: '',
      eol: '',
      cutter: '',
      other: '',
      soldCapa: '',
      flex: '',
      possibleMax: '',
      comment: '',
      sop: '',
      eop: '',
      service: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    console.log('data: ', data);
    console.log('zapis');
    // const res = await saveArticleConfig(convertedData);
    setIsPending(false);
    // if (res?.success) {
    //   toast.success(cDict.toasts.articleSaved);
    //   // form.reset();
    // } else if (res?.error === 'exists') {
    //   toast.error(cDict.toasts.articleExists);
    // }
  };

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>Dodaj CAPA</CardTitle>
        {/* <CardDescription>{cDict.cardDescription}</CardDescription> */}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='client'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klient</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='line'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linia</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artykuł</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='articleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='clientPartNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer części klienta</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='piff'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIFF</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='processDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis procesu</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rep160t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 160T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              // TODO: form.reset() is not working for hydra process
              onClick={() => form.reset()}
            >
              Wyczyść
            </Button>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Dodawanie
              </Button>
            ) : (
              <Button type='submit'>Dodaj</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
