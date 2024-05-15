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
import { Loader2, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { insertArticleConfig } from '../../actions';
import Link from 'next/link';
// import { useQuery } from '@tanstack/react-query';

export default function AddArticleConfig({ lang }: { lang: string }) {
  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z
    .object({
      _id: z.string().optional(),
      workplace: z
        .string()
        .min(4, { message: 'Workplace must be at least 4 characters long' }),
      articleNumber: z
        .string()
        .length(5, { message: 'Article number must be exactly 5 digits' })
        .regex(/^[0-9]{5}$/, {
          message: 'Article number must consist of 5 digits',
        }),
      articleName: z
        .string()
        .min(5, { message: 'Article name must be at least 5 characters long' }),
      articleNote: z.string().optional(),
      piecesPerBox: z
        .number({
          required_error: 'Pieces per box is required',
          invalid_type_error: 'Pieces per box must be a number',
        })
        .refine((value) => !isNaN(value), {
          message: 'Pieces per box must be a valid number',
        }),
      pallet: z.boolean().optional(),
      boxesPerPallet: z
        .number()
        .optional()
        .refine((value) => value !== undefined, {
          message: 'Boxes per pallet must be a valid number',
        }),
      dmc: z
        .string()
        .min(10, { message: 'DMC code must be at least 10 characters long' }),
      dmcFirstValidation: z.string().min(4, {
        message: 'DMC first validation must be at least 4 characters long',
      }),
      secondValidation: z.boolean().optional(),
      dmcSecondValidation: z.string().optional(),
      hydraProcess: z
        .string()
        .refine((value) => (value.match(/\d/g) || []).length >= 3, {
          message: 'Hydra process code must contain at least 3 digits',
        }),
      ford: z.boolean().optional(),
      bmw: z.boolean().optional(),
    })
    .refine(
      (data) =>
        !data.pallet ||
        (data.pallet &&
          data.boxesPerPallet !== undefined &&
          !isNaN(data.boxesPerPallet)),
      {
        message: 'If using a pallet, boxes per pallet must be a valid number',
        path: ['boxesPerPallet'],
      },
    )
    .refine((data) => data.dmc.includes(data.dmcFirstValidation), {
      message: 'DMC first validation must be included in the full DMC code',
      path: ['dmcFirstValidation'],
    })
    .refine((data) => !(data.secondValidation && !data.dmcSecondValidation), {
      message:
        'DMC second validation is required when second validation is true',
      path: ['dmcSecondValidation'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workplace: '',
      articleNumber: '',
      articleName: '',
      articleNote: '',
      piecesPerBox: undefined,
      pallet: false,
      boxesPerPallet: undefined,
      dmc: '',
      dmcFirstValidation: '',
      secondValidation: false,
      dmcSecondValidation: '',
      hydraProcess: lang === 'pl' ? '' : '050',
      ford: false,
      bmw: false,
    },
  });

  const isPalletChecked = form.watch('pallet');
  const isSecondValidationChecked = form.watch('secondValidation');

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    const res = await insertArticleConfig(data);
    setIsPending(false);
    if (res?.success) {
      toast.success('Article saved successfully! Go celebrate!');
      // form.reset(); // Uncomment to reset the form after a successful save.
    } else if (res?.error === 'exists') {
      toast.error('Whoops! This article already exists! Try a new one!');
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Add article config</CardTitle>
        {/* <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/admin/dmcheck-configs'>
            <Button className='mr-2' variant='outline'>
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
              name='workplace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace</FormLabel>
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
                  <FormLabel>Number</FormLabel>
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
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='piecesPerBox'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pieces / box</FormLabel>
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
                        <FormLabel>Pallet label</FormLabel>
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
                        <FormLabel>Boxes / pallet</FormLabel>
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
                  <FormLabel>DMC full content</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>{cDict.dmcFormDescription}</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dmcFirstValidation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validation string</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    {cDict.dmcFirstValidationFormDescription}
                  </FormDescription> */}
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
                    <FormLabel>Second validation</FormLabel>
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
                    <FormLabel>Second validation string</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      {cDict.dmcSecondValidationFormDescription}
                    </FormDescription> */}
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
                        <SelectValue placeholder='Select process' />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value='050'>050 - EOL</SelectItem>
                      {lang === 'pl' && (
                        <SelectItem value='090'>090 - Q3</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                  You can manage email addresses in your{' '}
                </FormDescription> */}
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
                        <FormLabel>FORD date validation</FormLabel>
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
                        <FormLabel>BMW date validation</FormLabel>
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
              // TODO: form.reset() is not working for hydra process
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Adding
              </Button>
            ) : (
              <Button type='submit'>Add</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
