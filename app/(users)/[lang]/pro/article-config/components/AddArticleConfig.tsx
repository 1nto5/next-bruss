'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { resetPassword, login } from '@/app/(users)/[lang]/auth/actions';
// import { AuthError } from 'next-auth';

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import NoDict from '../../../components/NoDict';

export default function AddArticleConfig({ dict }: any) {
  const cDict = dict?.articleConfig?.add;

  // const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPendingSending, setIsPendingSending] = useState(false);

  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z
    .object({
      workplace: z.string().regex(/^[a-zA-Z]{3}\d{2}$/, {
        message: cDict.z.workplace,
      }),
      articleNumber: z
        .string()
        .length(5, { message: cDict.z.articleNumber })
        .regex(/^[0-9]{5}$/, {
          message: cDict.z.articleNumber,
        }),
      articleName: z.string().min(10, { message: cDict.z.articleName }),
      piecesPerBox: z.string().refine((value) => !isNaN(parseInt(value)), {
        message: cDict.z.piecesPerBox,
      }),
      pallet: z.boolean().default(false).optional(),
      boxesPerPallet: z.string().optional(),
      dmc: z
        .string({ required_error: cDict.z.dmc })
        .min(10, { message: cDict.z.dmc }),
      dmcFirstValidation: z
        .string()
        .min(4, { message: cDict.z.dmcFirstValidation }),
      secondValidation: z.boolean().default(false).optional(),
      dmcSecondValidation: z.string().optional(),
    })
    .refine(
      (data) =>
        data.pallet && data.boxesPerPallet && /^\d+$/.test(data.boxesPerPallet),
      {
        message: cDict.z.boxesPerPallet,
        path: ['boxesPerPallet'],
      },
    )
    .refine((data) => !(data.secondValidation && !data.dmcSecondValidation), {
      message: cDict.z.dmcSecondValidation,
      path: ['dmcSecondValidation'],
    })
    .refine(
      (data) =>
        !(
          data.secondValidation &&
          data.dmcSecondValidation &&
          data.dmcSecondValidation.length < 4
        ),
      {
        message: cDict.z.dmcSecondValidation,
        path: ['dmcSecondValidation'],
      },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workplace: '', // TODO: workplaces list?
      articleNumber: '',
      articleName: '',
      piecesPerBox: '',
      pallet: false,
      boxesPerPallet: '',
      dmcFirstValidation: '',
      secondValidation: false,
    },
  });
  const isPalletChecked = form.watch('pallet');
  const isSecondValidationChecked = form.watch('secondValidation');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // if (
    //   values.pallet &&
    //   (!values.boxesPerPallet ||
    //     isNaN(parseInt(values.boxesPerPallet)) ||
    //     parseInt(values.boxesPerPallet) <= 3)
    // ) {
    //   form.setError('boxesPerPallet', {
    //     type: 'manual',
    //     message: cDict.z.boxesPerPallet,
    //   });
    //   return;
    // }

    try {
      setIsPending(true);
      await login(values.articleNumber, values.workplace);
      // if (!res) {
      //   toast.error('Nieprawidłowe dane logowania!');
      //   return;
      // }
      // console.log('res: ', res);
    } catch (error) {
      // console.error(error);
      // toast.error('Skontaktuj się z IT!');
      toast.error('Nieprawidłowe dane logowania!');
      return;
    } finally {
      setIsPending(false);
    }
  }

  async function onResetPassword() {
    const email = form.getValues('articleNumber');
    // console.log('email: ', email);
    if (!email) {
      toast.error('Wprowadź email by zresetować hasło!');
      return;
    }
    try {
      setIsPendingSending(true);
      const result = await resetPassword(email);
      if (!result) {
        toast.error('Skontaktuj się z IT!');
        return;
      }

      if (result.status === 'sent') {
        toast.success('Wysłano link do resetowania hasła!');
        return;
      }

      if (result?.error) {
        toast.error('Skontaktuj się z IT!');
        console.error('User password reset was unsuccessful.:', result?.error);
      }

      if (result.status === 'not exists') {
        toast.error('Brak użytkownika o podanym adresie email!');
        return;
      }
    } catch (error) {
      console.error('User password reset was unsuccessful.:', error);
      toast.error('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPendingSending(false);
    }
  }

  if (!cDict) return <NoDict />;

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
          </CardContent>
          <CardFooter className='flex justify-between'>
            {isPendingSending ? (
              <Button type='button' variant='destructive' disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Wysyłanie email
              </Button>
            ) : (
              <Button
                onClick={onResetPassword}
                type='button'
                variant='destructive'
              >
                Reset hasła
              </Button>
            )}
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Logowanie
              </Button>
            ) : (
              <Button type='submit'>Zaloguj</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
