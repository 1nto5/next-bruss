'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm({ cDict }: { cDict: any }) {
  const [isPending, setIsPending] = useState(false);

  const formSchema = z.object({
    email: z
      .string()
      .min(23, { message: cDict.zod.emailTooShort })
      .regex(/@bruss-group\.com$/, {
        message: cDict.zod.emailNotFromBruss,
      }),
    password: z.string().min(1, { message: cDict.zod.passwordEmpty }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values.email, values.password);
    try {
      setIsPending(true);
      const res = await login(values.email, values.password);
      console.log('res: ', res);
      if (!res || res.error === 'default error') {
        toast.error(cDict.toasts.pleaseContactIt);
        return;
      }
      if (res.error === 'invalid credentials') {
        toast.error(cDict.toasts.credentialsError);
        return;
      }
      toast.success(cDict.toasts.loginSuccess);
      // if (!res) {
      //   toast.error('Nieprawidłowe dane logowania!');
      //   return;
      // }
      // console.log('res: ', res);
    } catch (error) {
      // console.error(error);
      // toast.error('Skontaktuj się z IT!');
      toast.error(cDict.toasts.loginError);
      return;
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className='w-[400px]'>
      {/* <CardHeader>
        <CardTitle>Wprowadź dane logowania</CardTitle>
        <CardDescription>Wprowadź dane aby się zalogować:</CardDescription>
      </CardHeader> */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mt-4 grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.emailInputLabel}</FormLabel>
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
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.passwordInputLabel}</FormLabel>
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
          </CardContent>
          <CardFooter className='flex justify-between'>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {cDict.loggingButton}
              </Button>
            ) : (
              <Button type='submit'>{cDict.loginButton}</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
