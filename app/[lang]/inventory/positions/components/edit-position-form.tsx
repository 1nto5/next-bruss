'use client';

import { PositionType } from '@/app/[lang]/inventory/lib/types';
import { createUpdatePositionSchema } from '@/app/[lang]/inventory/lib/zod';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { updatePosition as update } from '../../actions';
import { Dictionary } from '../../lib/dict';
import LocalizedLink from '@/components/localized-link';

export default function EditPositionForm({
  position,
  dict,
  returnUrl = '/inventory',
}: {
  position: PositionType;
  dict: Dictionary;
  returnUrl?: string;
}) {
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang as string;

  const updatePositionSchema = createUpdatePositionSchema(dict.validation);

  const form = useForm<z.infer<typeof updatePositionSchema>>({
    resolver: zodResolver(updatePositionSchema) as any,
    defaultValues: {
      articleNumber: position.articleNumber,
      quantity: position.quantity,
      wip: position.wip,
      unit: position.unit,
      comment: position.comment || '',
      bin: position.bin || '',
      deliveryDate: position.deliveryDate
        ? new Date(position.deliveryDate)
        : undefined,
      approved: position.approver ? true : false,
    },
  });

  const onSubmit = async (data: z.infer<typeof updatePositionSchema>) => {
    setIsPendingUpdate(true);
    try {
      const res = await update(position.identifier, data);
      if (res.success) {
        toast.success(dict.editDialog.positionSaved);
        // Navigate back
        router.push(`/${lang}${returnUrl}`);
      } else if (res.error === 'article not found') {
        form.setError('articleNumber', { message: dict.editDialog.errors.articleNotFound });
      } else if (res.error === 'wip not allowed') {
        form.setError('wip', { message: dict.editDialog.errors.wipNotAllowed });
      } else if (res.error === 'unauthorized') {
        toast.error(dict.editDialog.errors.unauthorized);
      } else if (res.error) {
        console.error(res.error);
        toast.error(dict.common.contactIT);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error(dict.common.contactIT);
    } finally {
      setIsPendingUpdate(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.editDialog.fields.article}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.editDialog.fields.quantity} {`[${position.unit}]`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        // Replace comma with period
                        const value = e.target.value.replace(',', '.');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='wip'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-2'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>{dict.editDialog.fields.wip}</FormLabel>
                  </div>
                  <FormMessage />
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='approved'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      {dict.editDialog.fields.approve}
                    </FormLabel>
                    {position.approver && (
                      <FormDescription>
                        {dict.editDialog.alreadyApproved.replace('{approver}', position.approver)}
                      </FormDescription>
                    )}
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

            <FormField
              control={form.control}
              name='bin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.editDialog.fields.storageBin}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='deliveryDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.editDialog.fields.deliveryDate}</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      modal
                      hideTime
                      value={field.value}
                      onChange={field.onChange}
                      renderTrigger={({ open, value, setOpen }) => (
                        <DateTimeInput
                          value={value}
                          onChange={(x) => !open && field.onChange(x)}
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

            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.editDialog.fields.comment}</FormLabel>
                  <FormControl>
                    <Textarea className='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </CardContent>

        <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
          <LocalizedLink href={returnUrl}>
            <Button
              variant='destructive'
              type='button'
              className='w-full sm:w-auto'
              disabled={isPendingUpdate}
            >
              <CircleX className='' />
              {dict.common.cancel}
            </Button>
          </LocalizedLink>
          <Button
            type='submit'
            className='w-full sm:w-auto'
            disabled={isPendingUpdate}
          >
            <Save className={isPendingUpdate ? 'animate-spin' : ''} />
            {dict.editDialog.save}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
