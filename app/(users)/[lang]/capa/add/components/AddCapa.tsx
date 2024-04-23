'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  // FormDescription,
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
  // CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { saveCapa } from '../../actions';

export default function AddCapa() {
  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z.object({
    client: z.string().min(2, { message: 'Pole jest wymagane!' }),
    line: z.string().min(3, { message: 'Pole jest wymagane!' }),
    articleNumber: z
      .string()
      .min(5, { message: 'Wprowadź poprawny numer artykułu!' }),
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
      client: 'BMW ',
      line: 'Las Vegas',
      articleNumber: '12345',
      articleName: 'Test article',
      clientPartNumber: '123551231',
      piff: '2134',
      processDescription: 'test process description',
      // client: '',
      // line: '',
      // articleNumber: '',
      // articleName: '',
      // clientPartNumber: '',
      // piff: '',
      // processDescription: '',
      // rep160t: '',
      // rep260t: '',
      // rep260t2k: '',
      // rep300t: '',
      // rep300t2k: '',
      // rep400t: '',
      // rep500t: '',
      // b50: '',
      // b85: '',
      // engel: '',
      // eol: '',
      // cutter: '',
      // other: '',
      // soldCapa: '',
      // flex: '',
      // possibleMax: '',
      // comment: '',
      // sop: '',
      // eop: '',
      // service: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    console.log('data: ', data);
    console.log('zapis');
    const res = await saveCapa(data);
    setIsPending(false);
    if (res?.success) {
      toast.success('CAPA zapisana!');
      // form.reset();
    } else if (res?.error === 'exists') {
      toast.error('CAPA już istnieje, przejdź do edycji!');
    }
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
            <FormField
              control={form.control}
              name='rep260t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 260t</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep260t2k'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 260T 2K</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep300t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 300T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep300t2k'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 300T 2K</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep400t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 400T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep500t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 500T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='b50'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B50</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='b85'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B85</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='engel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ENGEL</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='eol'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EOL</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cutter'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obcinarki</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='other'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inne</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='soldCapa'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprzedana CAPA</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='flex'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flex?</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='possibleMax'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Możliwa MAX CAPA</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentarz</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SOP</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='eop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EOP</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='service'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy serwisowy?</FormLabel>
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
