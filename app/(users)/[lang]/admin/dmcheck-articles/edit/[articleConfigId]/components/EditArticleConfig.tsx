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
// import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateArticleConfig } from '../../../actions';
import Link from 'next/link';
import { Table } from 'lucide-react';
import { ArticleConfigType } from '@/lib/types/articleConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

export default function EditArticleConfig({
  lang,
  articleConfigObject,
}: {
  lang: string;
  articleConfigObject: ArticleConfigType;
}) {
  const formSchema = z
    .object({
      _id: z.string().optional(),
      workplace: z
        .string()
        .min(4, { message: 'Workplace must be at least 4 characters long' }),
      articleNumber: z
        .string()
        .refine((value) => /^\d{5}$|^\d{2}\.\d{6}\.\d{2}$/.test(value), {
          message:
            'Article number must be in the format: XXXXX or 10.0XXXXX.00 (X - integer)',
        }),
      articleName: z
        .string()
        .min(5, { message: 'Article name must be at least 5 characters long' }),
      articleNote: z.string().optional(),
      piecesPerBox: z.string().refine((value) => !isNaN(parseInt(value)), {
        message: 'Pieces per box must be a valid number',
      }),
      pallet: z.boolean().optional(),
      boxesPerPallet: z.string().optional(),
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
          data.boxesPerPallet &&
          /^\d+$/.test(data.boxesPerPallet)),
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
      workplace: articleConfigObject.workplace,
      articleNumber: articleConfigObject.articleNumber,
      articleName: articleConfigObject.articleName,
      articleNote: articleConfigObject.articleNote,
      piecesPerBox: articleConfigObject.piecesPerBox.toString(),
      pallet: articleConfigObject.pallet,
      boxesPerPallet: articleConfigObject.boxesPerPallet?.toString() ?? '',
      dmc: articleConfigObject.dmc,
      dmcFirstValidation: articleConfigObject.dmcFirstValidation,
      secondValidation: articleConfigObject.secondValidation,
      dmcSecondValidation: articleConfigObject.dmcSecondValidation,
      hydraProcess: articleConfigObject.hydraProcess,
      ford: articleConfigObject.ford,
      bmw: articleConfigObject.bmw,
    },
  });

  const isPalletChecked = form.watch('pallet');
  const isSecondValidationChecked = form.watch('secondValidation');

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await updateArticleConfig({
        _id: articleConfigObject._id,
        ...data,
        workplace: data.workplace.toLowerCase(),
        piecesPerBox: parseInt(data.piecesPerBox),
        boxesPerPallet: parseInt(data.boxesPerPallet ?? ''),
      });
      if (res?.success) {
        toast.success('Article config updated!');
      } else if (res?.error) {
        console.error('Error updating article config:', res?.error);
        toast.error('An error occurred! Check console for more info.');
      }
    } catch (error) {
      console.error('Error updating article config:', error);
      toast.error(
        'An error occurred while updating the article. Please try again.',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Edit article config</CardTitle>
        {/* <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/admin/dmcheck-articles'>
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
          <CardFooter className='flex justify-end'>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating
              </Button>
            ) : (
              <Button type='submit'>Update</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
