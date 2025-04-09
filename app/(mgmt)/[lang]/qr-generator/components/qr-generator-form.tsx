'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileScan } from 'lucide-react';
import { generateQrCodePdf } from '../lib/pdf-generator';

const formSchema = z.object({
  listItems: z
    .string()
    .min(1, 'Please enter at least one item')
    .refine((val) => val.trim().length > 0, {
      message: 'List cannot be empty',
    }),
  title: z.string().optional(),
  pageSize: z.enum(['standard', 'a4', 'a3']).default('standard'),
  qrSize: z.number().int().default(85),
  fontSize: z.number().int().default(48),
  spacing: z.number().int().default(22),
});

export default function QrGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listItems: '',
      title: '',
      pageSize: 'standard',
      qrSize: 85,
      fontSize: 48,
      spacing: 22,
    },
  });

  const selectedPageSize = form.watch('pageSize');

  useEffect(() => {
    if (selectedPageSize === 'standard') {
      form.setValue('qrSize', 85);
      form.setValue('fontSize', 48);
      form.setValue('spacing', 22);
    } else if (selectedPageSize === 'a4') {
      form.setValue('qrSize', 190);
      form.setValue('fontSize', 105);
      form.setValue('spacing', 80);
    } else if (selectedPageSize === 'a3') {
      form.setValue('qrSize', 270);
      form.setValue('fontSize', 150);
      form.setValue('spacing', 120);
    }
  }, [selectedPageSize, form]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (isGenerating) return; // Prevent multiple submissions

      try {
        setIsGenerating(true);

        const items = values.listItems
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (items.length === 0) {
          toast.error('Please enter at least one item');
          return;
        }

        // Force a UI update before proceeding with the heavy operation
        await new Promise((resolve) => setTimeout(resolve, 50));

        await generateQrCodePdf({
          items,
          title: values.title || 'QR Codes',
          pageSize: values.pageSize,
          qrSize: values.qrSize,
          fontSize: values.fontSize,
          spacing: values.spacing,
        });

        toast.success('PDF generated successfully!');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF');
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating],
  );

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>
          Enter a list of items (one per line) to generate QR codes
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='QR Codes' {...field} />
                  </FormControl>
                  <FormDescription>
                    This will appear as the title of the PDF document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='pageSize'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || 'standard'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a verified email to display' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='standard'>
                        Standard (125x104 mm - production label)
                      </SelectItem>
                      <SelectItem value='a4'>A4 (210x297 mm)</SelectItem>
                      <SelectItem value='a3'>A3 (297x420 mm)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='qrSize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QR Code Size (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Size of QR code in millimeters
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fontSize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Size (pt)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Size of text below QR code
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='spacing'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spacing (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>Space between QR and text</FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='listItems'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List of Items</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter items (one per line)...'
                      className=''
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Each line will be converted to a QR code on a separate page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isGenerating}>
              <FileScan className={isGenerating ? 'animate-spin' : ''} />{' '}
              Generate QR Code PDF
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
