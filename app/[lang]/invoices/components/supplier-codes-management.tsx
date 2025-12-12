'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  createSupplierCode,
  deleteSupplierCode,
  updateSupplierCode,
} from '../actions';
import { Dictionary } from '../lib/dict';
import { SupplierCodeType } from '../lib/types';

const currencyOptions = ['EUR', 'GBP', 'USD', 'PLN'] as const;

const scSchema = z.object({
  code: z.string().min(1, 'Kod jest wymagany'),
  description: z.string().min(3, 'Opis min. 3 znaki'),
  owner: z.string().email('Podaj poprawny email'),
  ownerName: z.string().optional(),
  maxValue: z.number().nonnegative().optional(),
  maxCurrency: z.enum(currencyOptions).optional(),
  status: z.enum(['active', 'inactive']),
});

type SCFormData = z.infer<typeof scSchema>;

interface SupplierCodesManagementProps {
  dict: Dictionary;
  lang: string;
  codes: SupplierCodeType[];
}

export default function SupplierCodesManagement({
  dict,
  lang,
  codes,
}: SupplierCodesManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<SupplierCodeType | null>(null);

  const form = useForm<SCFormData>({
    resolver: zodResolver(scSchema),
    defaultValues: {
      code: '',
      description: '',
      owner: '',
      ownerName: '',
      maxValue: undefined,
      maxCurrency: 'EUR',
      status: 'active',
    },
  });

  function openAddDialog() {
    setEditingCode(null);
    form.reset({
      code: '',
      description: '',
      owner: '',
      ownerName: '',
      maxValue: undefined,
      maxCurrency: 'EUR',
      status: 'active',
    });
    setDialogOpen(true);
  }

  function openEditDialog(sc: SupplierCodeType) {
    setEditingCode(sc);
    form.reset({
      code: sc.code,
      description: sc.description,
      owner: sc.owner,
      ownerName: sc.ownerName || '',
      maxValue: sc.maxValue || undefined,
      maxCurrency: sc.maxCurrency || 'EUR',
      status: sc.status,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: SCFormData) {
    setIsLoading(true);

    let result;
    if (editingCode) {
      result = await updateSupplierCode(editingCode._id, {
        description: data.description,
        owner: data.owner,
        ownerName: data.ownerName,
        maxValue: data.maxValue,
        maxCurrency: data.maxCurrency,
        status: data.status,
      });
    } else {
      result = await createSupplierCode({
        code: data.code,
        description: data.description,
        owner: data.owner,
        ownerName: data.ownerName,
        maxValue: data.maxValue,
        maxCurrency: data.maxCurrency,
      });
    }

    setIsLoading(false);

    if (result.error) {
      if (result.error === 'code-exists') {
        toast.error(dict.supplierCodes.codeExists);
      } else {
        toast.error(dict.toast.contactIT);
      }
      return;
    }

    toast.success(editingCode ? dict.toast.updated : dict.toast.created);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Na pewno usunąć ten kod?')) return;

    setIsLoading(true);
    const result = await deleteSupplierCode(id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.toast.deleted);
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href={`/${lang}/invoices`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h1 className='text-2xl font-bold'>{dict.supplierCodes.title}</h1>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className='mr-2 h-4 w-4' />
          {dict.supplierCodes.add}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.supplierCodes.list}</CardTitle>
          <CardDescription>{dict.supplierCodes.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.supplierCodes.code}</TableHead>
                  <TableHead>{dict.supplierCodes.descriptionLabel}</TableHead>
                  <TableHead>{dict.supplierCodes.owner}</TableHead>
                  <TableHead>{dict.supplierCodes.limit}</TableHead>
                  <TableHead>{dict.supplierCodes.status}</TableHead>
                  <TableHead className='w-[100px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      {dict.supplierCodes.noCodes}
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((sc) => (
                    <TableRow key={sc._id}>
                      <TableCell className='font-medium'>{sc.code}</TableCell>
                      <TableCell>{sc.description}</TableCell>
                      <TableCell>
                        {sc.ownerName || extractNameFromEmail(sc.owner)}
                      </TableCell>
                      <TableCell>
                        {sc.maxValue
                          ? `${sc.maxValue.toLocaleString()} ${sc.maxCurrency}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sc.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {sc.status === 'active'
                            ? dict.supplierCodes.active
                            : dict.supplierCodes.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEditDialog(sc)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(sc._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCode ? dict.supplierCodes.edit : dict.supplierCodes.add}
            </DialogTitle>
            <DialogDescription>
              {editingCode
                ? dict.supplierCodes.editDescription
                : dict.supplierCodes.addDescription}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.supplierCodes.code}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='SC-001'
                        disabled={!!editingCode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.supplierCodes.descriptionLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={dict.supplierCodes.descriptionPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='owner'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.supplierCodes.owner}</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='jan.kowalski@bruss-group.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='ownerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.supplierCodes.ownerName}</FormLabel>
                      <FormControl>
                        <Input placeholder='Jan Kowalski' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='maxValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.supplierCodes.limit}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder={dict.supplierCodes.noLimit}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxCurrency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.form.currency}</FormLabel>
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
                          {currencyOptions.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {editingCode && (
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel>{dict.supplierCodes.active}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 'active' : 'inactive')
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  {dict.common.cancel}
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {editingCode ? dict.common.save : dict.supplierCodes.add}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
