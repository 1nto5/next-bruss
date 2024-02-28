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
import { saveArticleConfig } from '../actions';
// import { useQuery } from '@tanstack/react-query';

export default function AddArticleConfig({ dict }: any) {
  const cDict = dict?.articleConfig?.add;

  // TODO: jak pallet false to nie dziaa zapis
  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z
    .object({
      workplace: z.string().min(4, { message: cDict.z.workplace }),
      articleNumber: z
        .string()
        .length(5, { message: cDict.z.articleNumber })
        .regex(/^[0-9]{5}$/, {
          message: cDict.z.articleNumber,
        }),
      articleName: z.string().min(10, { message: cDict.z.articleName }),
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
        .refine((value) => (value.match(/\d/g) || []).length >= 3, {
          message: cDict.z.hydraProcess,
        }),
      ford: z.boolean().default(false).optional(),
      bmw: z.boolean().default(false).optional(),
    })
    // .refine(
    //   (data) =>
    //     data.pallet && data.boxesPerPallet && /^\d+$/.test(data.boxesPerPallet),
    //   {
    //     message: cDict.z.boxesPerPallet,
    //     path: ['boxesPerPallet'],
    //   },
    // )
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

    // defaultValues: {
    //   workplace: 'eol34',
    //   articleNumber: '12345',
    //   articleName: 'Test Article',
    //   articleNote: 'This is a test note',
    //   piecesPerBox: '10',
    //   pallet: true,
    //   boxesPerPallet: '20',
    //   dmc: 'Test DM 123455',
    //   dmcFirstValidation: 'Test',
    //   secondValidation: false,
    //   dmcSecondValidation: '',
    //   hydraProcess: '050',
    //   ford: false,
    //   bmw: false,
    // },
  });

  const isPalletChecked = form.watch('pallet');
  const isSecondValidationChecked = form.watch('secondValidation');

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    console.log('data: ', data);
    const convertedData = {
      ...data,
      piecesPerBox: Number(data.piecesPerBox),
      boxesPerPallet: Number(data.boxesPerPallet),
    };

    const res = await saveArticleConfig(convertedData);
    setIsPending(false);
    if (res?.success) {
      toast.success(cDict.toasts.articleSaved);
      // form.reset();
    } else if (res?.error === 'exists') {
      toast.error(cDict.toasts.articleExists);
    }
  };

  if (!cDict) return <NoAvailable />;

  return (
    <Card>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={cDict.hydraProcessSelectPlaceholder}
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value='050'>
                        {cDict.hydraProcessSelectOption050}
                      </SelectItem>
                      <SelectItem value='090'>
                        {' '}
                        {cDict.hydraProcessSelectOption090}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                    You can manage email addresses in your{' '}
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

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
