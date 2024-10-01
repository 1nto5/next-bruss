'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { insertArticleConfig } from '../../../admin/dmcheck-articles/actions';
import NoAvailable from '../../../components/not-available';
// import { useQuery } from '@tanstack/react-query';

export default function AddArticleConfig({
  dict,
  lang,
}: {
  dict: any;
  lang: string;
}) {
  const cDict = dict?.articleConfig?.add;

  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z
    .object({
      workplace: z.string().min(4, { message: cDict.z.workplace }),
      articleNumber: z
        .string()
        .refine((value) => /^\d{5}$|^\d{2}\.\d{6}\.\d{2}$/.test(value), {
          message: cDict.z.articleNumber,
        }),
      articleName: z.string().min(5, { message: cDict.z.articleName }),
      articleNote: z.string().optional(),
      piecesPerBox: z.string().refine((value) => !isNaN(parseInt(value)), {
        message: cDict.z.piecesPerBox,
      }),
      pallet: z.boolean().default(false).optional(),
      boxesPerPallet: z.string().optional(),
      dmc: z
        .string({ required_error: cDict.z.dmc })
        .min(10, { message: cDict.z.dmc }),
      dmcFirstValidation: z.string().min(4, { message: cDict.z.dmcValidation }),
      secondValidation: z.boolean().default(false).optional(),
      dmcSecondValidation: z.string().optional(),
      hydraProcess: z
        .string({ required_error: cDict.z.hydraProcess })
        .refine((value) => /^\d{3}$/.test(value), {
          message: cDict.z.hydraProcess,
        }),
      ford: z.boolean().default(false).optional(),
      bmw: z.boolean().default(false).optional(),
    })
    .refine(
      (data) =>
        !data.pallet ||
        (data.pallet &&
          data.boxesPerPallet &&
          /^\d+$/.test(data.boxesPerPallet)),
      {
        message: cDict.z.boxesPerPallet,
        path: ['boxesPerPallet'],
      },
    )
    .refine((data) => data.dmc.includes(data.dmcFirstValidation), {
      message: cDict.z.dmcValidation,
      path: ['dmcFirstValidation'],
    })
    .refine((data) => !(data.secondValidation && !data.dmcSecondValidation), {
      message: cDict.z.dmcSecondValidation,
      path: ['dmcSecondValidation'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workplace: '',
      articleNumber: '',
      articleName: '',
      articleNote: '',
      piecesPerBox: '',
      pallet: false,
      boxesPerPallet: '',
      dmc: '',
      dmcFirstValidation: '',
      secondValidation: false,
      dmcSecondValidation: '',
      hydraProcess: '',
      ford: false,
      bmw: false,
    },
  });

  const isPalletChecked = form.watch('pallet');
  const isSecondValidationChecked = form.watch('secondValidation');

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await insertArticleConfig({
        ...data,
        workplace: data.workplace.toLowerCase(),
        piecesPerBox: parseInt(data.piecesPerBox),
        boxesPerPallet: parseInt(data.boxesPerPallet ?? ''),
      });
      setIsPending(false);
      if (res?.success) {
        toast.success(cDict.toasts.articleSaved);
        // form.reset();
      } else if (res?.error === 'exists') {
        toast.error(cDict.toasts.articleExists);
      }
    } catch (error) {
      console.error('Error saving article config:', error);
      toast.error(cDict.toasts.pleaseContactIt);
    } finally {
      setIsPending(false);
    }
  };

  if (!cDict) return <NoAvailable />;

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
        <CardDescription>{cDict.cardDescription}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='workplace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.workplaceFormLabel}</FormLabel>
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
                  <FormLabel>{cDict.articleNumberFormLabel}</FormLabel>
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
                  <FormLabel>{cDict.articleNameFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='articleNote'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.articleNoteFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    {cDict.articleNoteFormDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='piecesPerBox'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.piecesPerBoxFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {lang === 'pl' && (
              <>
                <FormField
                  control={form.control}
                  name='pallet'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>{cDict.palletFormLabel}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                {isPalletChecked && (
                  <FormField
                    control={form.control}
                    name='boxesPerPallet'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{cDict.boxesPerPalletFormLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder='' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <FormField
              control={form.control}
              name='dmc'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.dmcFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>{cDict.dmcFormDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dmcFirstValidation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.dmcFirstValidationFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    {cDict.dmcFirstValidationFormDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='secondValidation'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>
                      {cDict.secondValidationCheckboxFormLabel}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {isSecondValidationChecked && (
              <FormField
                control={form.control}
                name='dmcSecondValidation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cDict.dmcSecondValidationFormLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} />
                    </FormControl>
                    <FormDescription>
                      {cDict.dmcSecondValidationFormDescription}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='hydraProcess'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HYDRA proces</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    {cDict.hydraProcessFormDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {lang === 'pl' && (
              <>
                <FormField
                  control={form.control}
                  name='ford'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>{cDict.fordCheckboxFormLabel}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bmw'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>{cDict.bmwCheckboxFormLabel}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
            >
              {cDict.clearButton}
            </Button>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {cDict.addingButton}
              </Button>
            ) : (
              <Button type='submit'>{cDict.addButton}</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
