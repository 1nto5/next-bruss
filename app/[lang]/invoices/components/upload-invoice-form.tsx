'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { uploadInvoice } from '../actions';
import { Dictionary } from '../lib/dict';

const currencyOptions = ['EUR', 'GBP', 'USD', 'PLN'] as const;

const formSchema = z.object({
  invoiceNumber: z.string().min(1, 'Numer faktury jest wymagany'),
  supplier: z.string().optional(),
  supplierName: z.string().min(1, 'Nazwa dostawcy jest wymagana'),
  value: z.number().positive('Wartość musi być większa od 0'),
  currency: z.enum(currencyOptions),
  receiver: z.string().email('Podaj poprawny email odbiorcy'),
  invoiceDate: z.string().optional(),
  receiveDate: z.string().optional(),
  shortDescription: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UploadInvoiceFormProps {
  dict: Dictionary;
  lang: string;
}

export default function UploadInvoiceForm({
  dict,
  lang,
}: UploadInvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: '',
      supplier: '',
      supplierName: '',
      value: 0,
      currency: 'PLN',
      receiver: '',
      invoiceDate: '',
      receiveDate: new Date().toISOString().split('T')[0],
      shortDescription: '',
    },
  });

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await uploadInvoice({
        invoiceNumber: data.invoiceNumber,
        supplier: data.supplier || '',
        supplierName: data.supplierName,
        value: data.value,
        currency: data.currency,
        receiver: data.receiver,
        invoiceDate: data.invoiceDate || undefined,
        receiveDate: data.receiveDate || undefined,
        shortDescription: data.shortDescription || '',
      });

      if (result.error) {
        toast.error(dict.toast.contactIT);
        return;
      }

      toast.success(dict.toast.uploaded);
      router.push(`/${lang}/invoices`);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{dict.form.title}</CardTitle>
            <CardDescription>{dict.form.description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='invoiceNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.invoiceNumber}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dict.form.invoiceNumberPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='supplierName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.supplierName}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dict.form.supplierNamePlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.value}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.currency}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={dict.form.currencyPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='receiver'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>{dict.form.receiver}</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder={dict.form.receiverPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='invoiceDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.invoiceDate}</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='receiveDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.receiveDate}</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='shortDescription'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>{dict.form.shortDescription}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={dict.form.shortDescriptionPlaceholder}
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Save className='mr-2 h-4 w-4' />
            {dict.form.upload}
          </Button>
        </div>
      </form>
    </Form>
  );
}
