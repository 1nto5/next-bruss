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

import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddArticleConfig({ dict }: any) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPendingSending, setIsPendingSending] = useState(false);

  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z.object({
    workplace: z.string().regex(/^[a-zA-Z]{3}\d{2}$/, {
      message: dict?.articleConfig?.add.z.workplace,
    }),
    workplaceType: z
      .string()
      .refine((value) => value === 'dmc-box' || value === 'dmc-box-pallet', {
        message: dict?.articleConfig?.add.z.workplaceType,
      }),
    articleNumber: z
      .string()
      .length(5, { message: dict?.articleConfig?.add.z.articleNumber })
      .regex(/^[0-9]{5}$/, {
        message: dict?.articleConfig?.add.z.articleNumber,
      }),
    articleName: z
      .string()
      .length(10, { message: dict?.articleConfig?.add.z.articleName }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workplace: '',
      workplaceType: '',
      articleNumber: '',
      articleName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values.email, values.password);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle> {dict.articleConfig?.add.workplaceFormLabel}</CardTitle>
        <CardDescription>Wprowadź dane aby się zalogować:</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mt-4 grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='workplace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.articleConfig?.add.workplaceFormLabel}
                  </FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='' {...field} />
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
              name='workplaceType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {' '}
                    {dict.articleConfig?.add.workplaceTypeFormLabel}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='dmc-box'>
                        Skanowanie DMC oraz etykiet HYDRA
                      </SelectItem>
                      <SelectItem value='dmc-box-pallet'>Ge</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                    You can manage email addresses in your{' '}
                    <Link href='/examples/forms'>email settings</Link>.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.articleConfig?.add.articleNumberFormLabel}
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
              name='articleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.articleConfig?.add.articleNameFormLabel}
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
