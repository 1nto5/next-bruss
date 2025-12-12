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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createPurchaseRequest } from '../actions';
import { Dictionary } from '../lib/dict';
import { PurchaseApproverType } from '../lib/types';

const currencyOptions = ['EUR', 'GBP', 'USD', 'PLN'] as const;

const formSchema = z.object({
  supplier: z.string().optional(),
  supplierName: z.string().optional(),
  currency: z.enum(currencyOptions),
  manager: z.string().min(1, 'Wybierz kierownika'),
  items: z
    .array(
      z.object({
        description: z.string().min(3, 'Min. 3 znaki'),
        quantity: z.number().positive('Musi być > 0'),
        unitPrice: z.number().nonnegative('Nie może być ujemna'),
        article: z.string().optional(),
        link: z.string().optional(),
        reason: z.string().optional(),
      }),
    )
    .min(1, 'Dodaj co najmniej jedną pozycję'),
});

type FormData = z.infer<typeof formSchema>;

interface AddRequestFormProps {
  dict: Dictionary;
  lang: string;
  approvers: PurchaseApproverType[];
}

export default function AddRequestForm({
  dict,
  lang,
  approvers,
}: AddRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savingDraft, setSavingDraft] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: '',
      supplierName: '',
      currency: 'PLN',
      manager: '',
      items: [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          article: '',
          link: '',
          reason: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const total = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );

  async function onSubmit(data: FormData, isDraft: boolean) {
    if (isDraft) setSavingDraft(true);

    startTransition(async () => {
      const result = await createPurchaseRequest({
        supplier: data.supplier,
        supplierName: data.supplierName,
        currency: data.currency,
        manager: data.manager,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          article: item.article || '',
          link: item.link || '',
          reason: item.reason || '',
          currency: data.currency,
          euroRate: 1,
        })),
        isDraft,
      });

      setSavingDraft(false);

      if (result.error) {
        toast.error(dict.toast.contactIT);
        return;
      }

      toast.success(isDraft ? dict.toast.saved : dict.toast.submitted);
      router.push(`/${lang}/purchase-requests`);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{dict.form.title}</CardTitle>
            <CardDescription>
              Wypełnij formularz, aby utworzyć nowe zapotrzebowanie zakupowe.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='supplierName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.form.supplier}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dict.form.supplierPlaceholder}
                        {...field}
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
                          <SelectValue
                            placeholder={dict.form.currencyPlaceholder}
                          />
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
                name='manager'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>{dict.form.manager}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={dict.form.managerPlaceholder}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvers.map((approver) => (
                          <SelectItem
                            key={approver.userId}
                            value={approver.userId}
                          >
                            {approver.userName || approver.userId}
                            {approver.isFinalApprover && ' (Final)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>{dict.form.items}</CardTitle>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    article: '',
                    link: '',
                    reason: '',
                  })
                }
              >
                <Plus className='mr-2 h-4 w-4' />
                {dict.form.addItem}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[300px]'>
                      {dict.itemForm.description}
                    </TableHead>
                    <TableHead className='w-[100px]'>
                      {dict.itemForm.quantity}
                    </TableHead>
                    <TableHead className='w-[120px]'>
                      {dict.itemForm.unitPrice}
                    </TableHead>
                    <TableHead className='w-[120px]'>Wartość</TableHead>
                    <TableHead className='w-[200px]'>
                      {dict.itemForm.reason}
                    </TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder={dict.itemForm.descriptionPlaceholder}
                                  className='min-h-[60px] resize-none'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={1}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={0}
                                  step='0.01'
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <span className='font-medium'>
                          {(
                            (watchedItems[index]?.quantity || 0) *
                            (watchedItems[index]?.unitPrice || 0)
                          ).toLocaleString('pl-PL', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.reason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={dict.itemForm.reasonPlaceholder}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => remove(index)}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='mt-4 flex justify-end'>
              <div className='text-lg font-semibold'>
                Suma: {total.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}{' '}
                {form.watch('currency')}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
          >
            {savingDraft && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Save className='mr-2 h-4 w-4' />
            {dict.form.saveAsDraft}
          </Button>

          <Button
            type='button'
            disabled={isPending}
            onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
          >
            {isPending && !savingDraft && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            <Send className='mr-2 h-4 w-4' />
            {dict.form.submit}
          </Button>
        </div>
      </form>
    </Form>
  );
}
