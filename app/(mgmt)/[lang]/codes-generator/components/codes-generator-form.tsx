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
import { codesPdfGenerator } from '../lib/codes-pdf-generator';

const formSchema = z.object({
  listItems: z
    .string()
    .min(1, 'Please enter at least one item')
    .refine((val) => val.trim().length > 0, {
      message: 'List cannot be empty',
    }),
  title: z.string().optional(),
  pageSize: z.enum(['standard', 'a4', 'a3']).default('standard'),
  codeSize: z.number().int().default(85),
  fontSize: z.number().int().default(48),
  spacing: z.number().int().default(22),
  codeType: z.enum(['qr', 'barcode', 'dmc']).default('qr'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
});

export default function QrGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listItems: '',
      title: '',
      pageSize: 'standard',
      codeSize: 85,
      fontSize: 48,
      spacing: 22,
      codeType: 'qr',
      orientation: 'portrait',
    },
  });

  const selectedPageSize = form.watch('pageSize');
  const selectedCodeType = form.watch('codeType');

  useEffect(() => {
    if (selectedCodeType === 'dmc') {
      // For DMC, force specific settings
      form.setValue('pageSize', 'standard'); // Will be overridden to 15x15 in generator
      form.setValue('orientation', 'portrait');
      form.setValue('codeSize', 10);
      form.setValue('fontSize', 0); // No text for DMC
      form.setValue('spacing', 0);
    } else if (selectedPageSize === 'standard') {
      form.setValue('codeSize', 85);
      form.setValue('fontSize', 48);
      form.setValue('spacing', 22);
    } else if (selectedPageSize === 'a4') {
      form.setValue('codeSize', 190);
      form.setValue('fontSize', 105);
      form.setValue('spacing', 80);
    } else if (selectedPageSize === 'a3') {
      form.setValue('codeSize', 270);
      form.setValue('fontSize', 150);
      form.setValue('spacing', 120);
    }
  }, [selectedPageSize, selectedCodeType, form]);

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

        await codesPdfGenerator({
          items,
          title: values.title || 'QR Codes',
          pageSize: values.pageSize,
          codeSize: values.codeSize,
          fontSize: values.fontSize,
          spacing: values.spacing,
          codeType: values.codeType,
          orientation: values.orientation,
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
        <CardTitle>Code Generator</CardTitle>
        <CardDescription>
          Enter a list of items (one per line) to generate QR codes or barcodes
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
              name='codeType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select code type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='qr'>QR Code</SelectItem>
                      <SelectItem value='barcode'>Barcode</SelectItem>
                      <SelectItem value='dmc'>DMC (Data Matrix)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose between QR code, barcode, or DMC
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
                    disabled={selectedCodeType === 'dmc'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a verified email to display' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='standard'>
                        {selectedCodeType === 'dmc'
                          ? 'DMC Fixed Size (15x15 mm)'
                          : 'Standard (125x104 mm - production label)'}
                      </SelectItem>
                      <SelectItem value='a4'>A4 (210x297 mm)</SelectItem>
                      <SelectItem value='a3'>A3 (297x420 mm)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedCodeType === 'dmc' && (
                    <FormDescription>
                      DMC uses fixed 15x15 mm paper size
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='orientation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orientation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={selectedCodeType === 'dmc'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select orientation' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='portrait'>Portrait</SelectItem>
                      <SelectItem value='landscape'>Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedCodeType === 'dmc'
                      ? 'DMC uses fixed orientation'
                      : 'Choose page orientation'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='codeSize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Size (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        disabled={selectedCodeType === 'dmc'}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedCodeType === 'dmc'
                        ? 'DMC fixed at 10x10 mm'
                        : 'Size of code in millimeters'}
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
                        disabled={selectedCodeType === 'dmc'}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedCodeType === 'dmc'
                        ? 'No text for DMC'
                        : 'Size of text below code'}
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
                        disabled={selectedCodeType === 'dmc'}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedCodeType === 'dmc'
                        ? 'No spacing for DMC'
                        : 'Space between code and text'}
                    </FormDescription>
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
              Generate{' '}
              {form.watch('codeType') === 'qr'
                ? 'QR Code'
                : form.watch('codeType') === 'barcode'
                  ? 'Barcode'
                  : 'DMC'}{' '}
              PDF
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
