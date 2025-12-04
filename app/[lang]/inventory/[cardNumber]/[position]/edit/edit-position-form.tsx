'use client';

import { InventoryPositionForEdit } from '@/lib/data/get-inventory-position';
import { createUpdatePositionSchema } from '../../../lib/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/date-format';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  updatePosition as update,
  redirectToCardPositions,
} from '../../../actions';
import { Dictionary } from '../../../lib/dict';
import LocalizedLink from '@/components/localized-link';

export default function EditPositionForm({
  position,
  dict,
  lang,
  cardNumber,
}: {
  position: InventoryPositionForEdit;
  dict: Dictionary;
  lang: string;
  cardNumber: string;
}) {
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);

  const updatePositionSchema = createUpdatePositionSchema(dict.validation);

  const form = useForm<z.infer<typeof updatePositionSchema>>({
    resolver: zodResolver(updatePositionSchema) as any,
    defaultValues: {
      articleNumber: position.articleNumber,
      quantity: position.quantity,
      wip: position.wip,
      unit: '',
      comment: position.comment || '',
      bin: '',
      deliveryDate: undefined,
      approved: position.approver ? true : false,
    },
  });

  const onSubmit = async (data: z.infer<typeof updatePositionSchema>) => {
    setIsPendingUpdate(true);
    try {
      const res = await update(position.identifier, data);
      if (res.success) {
        toast.success(dict.editPage.success);
        redirectToCardPositions(lang, cardNumber);
      } else if (res.error === 'article not found') {
        form.setError('articleNumber', {
          message: dict.editPage.articleNotFound,
        });
      } else if (res.error === 'wip not allowed') {
        form.setError('wip', { message: dict.editPage.wipNotAllowed });
      } else if (res.error === 'unauthorized') {
        toast.error(dict.editPage.unauthorized);
      } else if (res.error) {
        console.error(res.error);
        toast.error(dict.editPage.error);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error(dict.editPage.error);
    } finally {
      setIsPendingUpdate(false);
    }
  };

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>
              {dict.editPage.title} {position.identifier}
            </CardTitle>
            {position.approver && position.approvedAt && (
              <CardDescription className='mt-1'>
                {dict.positions.approver}: {position.approver}, {dict.positions.approvedAt}: {formatDateTime(position.approvedAt)}
              </CardDescription>
            )}
          </div>
          <LocalizedLink href={`/inventory/${cardNumber}`}>
            <Button variant='outline' size='sm'>
              <ArrowLeft /> {dict.editPage.back}
            </Button>
          </LocalizedLink>
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid gap-4'>
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.positions.articleNumber}</FormLabel>
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
                  <FormLabel>{dict.positions.quantity}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
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
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      {dict.positions.wip}
                    </FormLabel>
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
                      {dict.positions.approved}
                    </FormLabel>
                    {position.approver && (
                      <FormDescription>
                        {dict.positions.approver}: {position.approver}
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
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.positions.comment}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <Separator className='mb-4' />

          <CardFooter className='flex justify-between'>
            <LocalizedLink href={`/inventory/${cardNumber}`}>
              <Button type='button' variant='outline'>
                {dict.editPage.discard}
              </Button>
            </LocalizedLink>
            <Button type='submit' disabled={isPendingUpdate}>
              {isPendingUpdate && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {dict.editPage.save}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
