'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';
import { useCodeStore } from '../lib/stores';
import { ovenLoginSchema as formSchema } from '../lib/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { setCode1, setCode2, setCode3 } = useCodeStore();
  const [code2Form, setCode2Form] = useState(false);
  const [code3Form, setCode3Form] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code1: '',
      code2: '',
      code3: '',
    },
  });

  useEffect(() => {
    if (!code2Form) {
      form.setValue('code2', undefined);
    }
  }, [code2Form]);

  useEffect(() => {
    if (!code3Form) {
      form.setValue('code3', undefined);
    }
  }, [code3Form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    console.log('data', data);
    try {
      const res = await login(data);
      if (res.error) {
        switch (res.error) {
          case 'wrong code 1':
            form.setError('code1', {
              type: 'manual',
              message: 'Ungültiger Mitarbeitercode 1!',
            });
            break;
          case 'wrong code 2':
            form.setError('code2', {
              type: 'manual',
              message: 'Ungültiger Mitarbeitercode 2!',
            });
            break;
          case 'wrong code 3':
            form.setError('code3', {
              type: 'manual',
              message: 'Ungültiger Mitarbeitercode 3!',
            });
            break;
          default:
            toast.error('Wenden Sie sich an die IT!');
        }
      } else if (res.success) {
        setCode1(data.code1);
        setCode2(data.code2 || '');
        setCode3(data.code3 || '');
        toast.success('Erfolgreich angemeldet!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Wenden Sie sich an die IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Anmeldung</CardTitle>
        {/* <CardDescription>
        </CardDescription> */}
      </CardHeader>

      <Form {...form}>
        <form
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <CardContent className='grid w-full items-center gap-4 '>
            <FormField
              control={form.control}
              name='code1'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mitarbeitercode 1</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete='off'
                      type='password'
                      placeholder=''
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Mitarbeiter 2</FormLabel>
              </div>
              <FormControl>
                <Switch checked={code2Form} onCheckedChange={setCode2Form} />
              </FormControl>
            </FormItem>

            {code2Form && (
              <>
                <FormField
                  control={form.control}
                  name='code2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitarbeitercode 2</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          type='password'
                          placeholder=''
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Mitarbeiter 3</FormLabel>
              </div>
              <FormControl>
                <Switch checked={code3Form} onCheckedChange={setCode3Form} />
              </FormControl>
            </FormItem>

            {code3Form && (
              <>
                <FormField
                  control={form.control}
                  name='code3'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitarbeitercode 3</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          type='password'
                          placeholder=''
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          <CardFooter className='flex justify-end'>
            {isPending ? (
              <Button disabled className='w-full'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Anmeldung
              </Button>
            ) : (
              <Button className='w-full'>Anmelden</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
