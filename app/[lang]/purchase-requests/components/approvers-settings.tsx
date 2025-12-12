'use client';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { addApprover, deleteApprover, updateApprover } from '../actions';
import { Dictionary } from '../lib/dict';
import { PurchaseApproverType } from '../lib/types';

const approverSchema = z.object({
  userId: z.string().email('Podaj poprawny email'),
  userName: z.string().optional(),
  isFinalApprover: z.boolean(),
  limits: z.object({
    perUnit: z.number().nonnegative().optional(),
    daily: z.number().nonnegative().optional(),
    weekly: z.number().nonnegative().optional(),
    monthly: z.number().nonnegative().optional(),
    yearly: z.number().nonnegative().optional(),
  }),
});

type ApproverFormData = z.infer<typeof approverSchema>;

interface ApproversSettingsProps {
  dict: Dictionary;
  lang: string;
  approvers: PurchaseApproverType[];
}

export default function ApproversSettings({
  dict,
  lang,
  approvers,
}: ApproversSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApprover, setEditingApprover] =
    useState<PurchaseApproverType | null>(null);

  const form = useForm<ApproverFormData>({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      userId: '',
      userName: '',
      isFinalApprover: false,
      limits: {
        perUnit: undefined,
        daily: undefined,
        weekly: undefined,
        monthly: undefined,
        yearly: undefined,
      },
    },
  });

  function openAddDialog() {
    setEditingApprover(null);
    form.reset({
      userId: '',
      userName: '',
      isFinalApprover: false,
      limits: {},
    });
    setDialogOpen(true);
  }

  function openEditDialog(approver: PurchaseApproverType) {
    setEditingApprover(approver);
    form.reset({
      userId: approver.userId,
      userName: approver.userName || '',
      isFinalApprover: approver.isFinalApprover,
      limits: approver.limits || {},
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: ApproverFormData) {
    setIsLoading(true);

    let result;
    if (editingApprover) {
      result = await updateApprover(editingApprover.userId, {
        userName: data.userName,
        isFinalApprover: data.isFinalApprover,
        limits: data.limits,
      });
    } else {
      result = await addApprover({
        userId: data.userId,
        userName: data.userName,
        isFinalApprover: data.isFinalApprover,
        limits: data.limits,
      });
    }

    setIsLoading(false);

    if (result.error) {
      if (result.error === 'already-exists') {
        toast.error('Ten użytkownik jest już akceptującym');
      } else {
        toast.error(dict.toast.contactIT);
      }
      return;
    }

    toast.success(editingApprover ? 'Zaktualizowano' : 'Dodano');
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(userId: string) {
    if (!confirm('Na pewno usunąć tego akceptującego?')) return;

    setIsLoading(true);
    const result = await deleteApprover(userId);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success('Usunięto');
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href={`/${lang}/purchase-requests`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h1 className='text-2xl font-bold'>{dict.settings.title}</h1>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className='mr-2 h-4 w-4' />
          {dict.settings.addApprover}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.approvers}</CardTitle>
          <CardDescription>{dict.settings.approversDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.settings.email}</TableHead>
                  <TableHead>{dict.settings.name}</TableHead>
                  <TableHead>{dict.settings.finalApprover}</TableHead>
                  <TableHead>{dict.settings.limits}</TableHead>
                  <TableHead className='w-[100px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center'>
                      {dict.settings.noApprovers}
                    </TableCell>
                  </TableRow>
                ) : (
                  approvers.map((approver) => (
                    <TableRow key={approver.userId}>
                      <TableCell className='font-medium'>
                        {approver.userId}
                      </TableCell>
                      <TableCell>{approver.userName || '—'}</TableCell>
                      <TableCell>
                        {approver.isFinalApprover ? (
                          <span className='text-green-600'>Tak</span>
                        ) : (
                          <span className='text-muted-foreground'>Nie</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {approver.limits ? (
                          <div className='text-sm'>
                            {approver.limits.perUnit && (
                              <div>
                                Na poz.: {approver.limits.perUnit.toLocaleString()}{' '}
                                EUR
                              </div>
                            )}
                            {approver.limits.monthly && (
                              <div>
                                Mies.: {approver.limits.monthly.toLocaleString()}{' '}
                                EUR
                              </div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEditDialog(approver)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(approver.userId)}
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
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingApprover
                ? dict.settings.editApprover
                : dict.settings.addApprover}
            </DialogTitle>
            <DialogDescription>
              {editingApprover
                ? 'Edytuj ustawienia akceptującego'
                : 'Dodaj nowego akceptującego zakupy'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.settings.email}</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='jan.kowalski@bruss-group.com'
                        disabled={!!editingApprover}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='userName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.settings.name}</FormLabel>
                    <FormControl>
                      <Input placeholder='Jan Kowalski' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isFinalApprover'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>{dict.settings.finalApprover}</FormLabel>
                      <FormDescription>
                        Może zatwierdzać ostatecznie
                      </FormDescription>
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

              <div className='space-y-2'>
                <h4 className='font-medium'>{dict.settings.limits}</h4>

                <FormField
                  control={form.control}
                  name='limits.perUnit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Na pozycję (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='Bez limitu'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='limits.monthly'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miesięcznie (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='Bez limitu'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

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
                  {editingApprover ? dict.common.save : dict.settings.add}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
