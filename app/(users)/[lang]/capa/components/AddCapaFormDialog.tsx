import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type AddCapaFormDialogProps = {
  cDict: any;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
};

export default function AddCapaFormDialog({
  cDict,
  isOpen,
  onOpenChange,
}: AddCapaFormDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const formSchema = z.object({
    email: z
      .string()
      .min(23, { message: 'test' })
      .regex(/@bruss-group\.com$/, {
        message: 'test',
      }),
    password: z.string().min(1, { message: 'test' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm'>{cDict.addButton}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{cDict.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => console.log('test'))}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.emailInputLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

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
            <DialogFooter className='flex justify-between'>
              {isPending ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {cDict.loggingButton}
                </Button>
              ) : (
                <Button type='submit'>{cDict.loginButton}</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
