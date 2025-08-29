'use client';

import { createNewsSchema } from '../lib/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createNews, updateNews, redirectToHome } from '../actions';
import { NewsType } from '../lib/types';
import { Plus, Loader2 } from 'lucide-react';

interface NewsFormProps {
  news?: NewsType;
  lang: string;
  dict: any; // Dictionary object
}

export default function NewsForm({ news, lang, dict }: NewsFormProps) {
  const [isPending, setIsPending] = useState(false);
  
  const newsSchema = createNewsSchema(dict.news.validation);
  
  const form = useForm<z.infer<typeof newsSchema>>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: news?.title || '',
      content: news?.content || '',
      isPinned: news?.isPinned || false
    }
  });
  
  const onSubmit = async (data: z.infer<typeof newsSchema>) => {
    setIsPending(true);
    try {
      const res = news 
        ? await updateNews(news._id, data)
        : await createNews(data);
        
      if (res.success) {
        toast.success(dict.news.messages[res.success] || res.success);
        redirectToHome(lang);
      } else if (res.error) {
        toast.error(res.error === 'unauthorized' 
          ? dict.news.messages.unauthorized 
          : dict.news.messages[res.error] || res.error
        );
      }
    } catch (error) {
      console.error('onSubmit error:', error);
      toast.error(dict.news.messages.saveError);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>{news ? dict.news.form.editTitle : dict.news.form.addTitle}</CardTitle>
      </CardHeader>
      <Separator className='mb-4' />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.news.form.titleLabel}</FormLabel>
                  <FormControl>
                    <Input 
                      autoFocus 
                      placeholder={dict.news.form.titlePlaceholder} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.news.form.contentLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={dict.news.form.contentPlaceholder}
                      className="min-h-[300px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='isPinned'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      {dict.news.form.pinnedLabel}
                    </FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      {dict.news.form.pinnedDescription}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className='flex justify-end'>
            <Button 
              type='submit' 
              disabled={isPending}
              className='min-w-32'
            >
              {isPending ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Plus />
              )}
              {news ? dict.news.form.updateButton : dict.news.form.addButton}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}