'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { PositionType } from '@/lib/types/inventory';
import { UpdateFailureSchema } from '@/lib/z/failure';
import { UpdatePositionSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { updatePosition as update } from '../actions';

export default function EditPositionDialog({
  position,
}: {
  position: PositionType;
}) {
  const [open, setOpen] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const form = useForm<z.infer<typeof UpdatePositionSchema>>({
    resolver: zodResolver(UpdatePositionSchema),
    defaultValues: {
      articleNumber: position.articleNumber,
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdatePositionSchema>) => {
    // setIsDraft(false);
    setIsPendingUpdate(true);
    try {
      const res = await update(position.identifier, data);
      if (res.success) {
        toast.success('Pozycja zapisana!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdate(false);
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button size={'sm'} variant={'outline'}>
            <Pencil />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='w-[700px] sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Edycja pozycji</DialogTitle>
          {/* <DialogDescription>
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[450px]'>
              <div className='grid items-center gap-2 p-2'>
                <FormField
                  control={form.control}
                  name='articleNumber'
                  render={({ field }) => (
                    <FormItem className='w-[100px]'>
                      <FormLabel>Nr art.</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className='mt-4'>
              {isPendingUpdate ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Zapisz
                </Button>
              ) : (
                <Button type='submit'>Zapisz</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
