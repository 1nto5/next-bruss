'use client';
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
import { Input } from '@/components/ui/input';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Table } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { saveCapa } from '../../../actions';

type CapaType = {
  client: string;
  line: string;
  articleNumber: string;
  articleName: string;
  clientPartNumber: string;
  piff: string;
  processDescription: string;
  rep160t?: string;
  rep260t?: string;
  rep260t2k?: string;
  rep300t?: string;
  rep300t2k?: string;
  rep400t?: string;
  rep500t?: string;
  b50?: string;
  b85?: string;
  engel?: string;
  eol?: string;
  cutter?: string;
  other?: string;
  soldCapa?: string;
  flex?: string;
  possibleMax?: string;
  comment?: string;
  sop?: string;
  eop?: string;
  service?: string;
  edited?: { date: string | Date; email: string };
};

export default function EditCapa({ data }: { data: CapaType }) {
  const date =
    typeof data.edited?.date === 'string'
      ? data.edited?.date
      : 'błąd formatowania daty';
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
    rep160t: z.string().optional(),
    rep260t: z.string().optional(),
    rep260t2k: z.string().optional(),
    rep300t: z.string().optional(),
    rep300t2k: z.string().optional(),
    rep400t: z.string().optional(),
    rep500t: z.string().optional(),
    b50: z.string().optional(),
    b85: z.string().optional(),
    engel: z.string().optional(),
    eol: z.string().optional(),
    cutter: z.string().optional(),
    other: z.string().optional(),
    soldCapa: z.string().optional(),
    flex: z.string().optional(),
    possibleMax: z.string().optional(),
    comment: z.string().optional(),
    sop: z.string().optional(),
    eop: z.string().optional(),
    service: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: data.client,
      line: data.line,
      articleNumber: data.articleNumber,
      articleName: data.articleName,
      clientPartNumber: data.clientPartNumber,
      piff: data.piff,
      processDescription: data.processDescription,
      rep160t: data.rep160t,
      rep260t: data.rep260t,
      rep260t2k: data.rep260t2k,
      rep300t: data.rep300t,
      rep300t2k: data.rep300t2k,
      rep400t: data.rep400t,
      rep500t: data.rep500t,
      b50: data.b50,
      b85: data.b85,
      engel: data.engel,
      eol: data.eol,
      cutter: data.cutter,
      other: data.other,
      soldCapa: data.soldCapa,
      flex: data.flex,
      possibleMax: data.possibleMax,
      comment: data.comment,
      sop: data.sop,
      eop: data.eop,
      service: data.service,
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await saveCapa(data);
      if (res?.success) {
        toast.success('CAPA zapisana!');
      } else if (res?.error) {
        console.error('An error occurred:', res?.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Edytuj CAPA {data.articleNumber}</CardTitle>
        <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription>
        <div className='flex items-center justify-end py-4'>
          <Link href='/capa'>
            <Button className='mr-2 justify-end' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
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
                    <Input autoFocus placeholder='' {...field} />
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
                    <Input disabled placeholder='' {...field} />
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
                  <FormLabel>Nazwa art.</FormLabel>
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
          <CardFooter className='flex justify-end'>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Zapisywanie
              </Button>
            ) : (
              <Button type='submit'>Zapisz</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
