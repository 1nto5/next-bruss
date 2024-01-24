// TODO: adding additional FormField -> no zod validation

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {} from '../actions';

const formSchema = z.object({
  articleNumber: z
    .string()
    .min(23, { message: 'Email jest za krótki!' })
    .regex(/@bruss-group\.com$/, {
      message: 'Podany email nie należy do domeny bruss-group.com!',
    }),
  workplace: z.string().min(1, { message: 'Password cannot be empty' }),
});

export default function AddArticleConfig({ dict }: any) {
  const [isPendingSearching, setIsPendingSearching] = useState(false);
  const [error, setError] = useState('');
  const [isPendingSetting, setIsPendingSetting] = useState(false);
  const [updated, setUpdated] = useState(0);
  const [openArticle, setOpenArticle] = useState(false);

  // it should be under function declaration -> no recreate on every render but how to add translations?
  // const formSchema = z.object({
  //   articleNumber: z
  //     .string()
  //     .length(5, { message: dict?.articleConfig?.add.z.articleNumber })
  //     .regex(/^[0-9]{5}$/, {
  //       message: dict?.articleConfig?.add.z.articleNumber,
  //     }),
  //   workplace: z.string().regex(/^[a-zA-Z]{3}\d{2}$/, {
  //     message: dict?.articleConfig?.add.z.workplace,
  //   }),
  // });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articleNumber: '',
      workplace: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('co się dzieje?');
  };

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>{dict?.articleConfig?.add.cardTitle}</CardTitle>
        {!error ? (
          <CardDescription>
            {dict?.articleConfig?.add.cardDescription}
          </CardDescription>
        ) : (
          <CardDescription className='text-red-700'>{error}</CardDescription>
        )}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mt-4 grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict?.articleConfig?.add.articleFormLabel}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    Wprowadź służbowy adres email.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='workplace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict?.articleConfig?.add.workplaceFormLabel}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    Wprowadź służbowy adres email.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </form>
      </Form>
      {/* {updated > 0 && (
            <CardFooter className='font-bold text-bruss'>
              Zaktualizowano pozycji: {updated}!
            </CardFooter>
          )} */}
    </Card>
  );
}
