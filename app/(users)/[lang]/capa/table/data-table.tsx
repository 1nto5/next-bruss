'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CopyPlus, RefreshCcw } from 'lucide-react';
import { revalidateCapa } from '../actions';
import Link from 'next/link';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetched?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetched,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>CAPA</CardTitle>
        <CardDescription>Ostatnia synchronizacja: {fetched}</CardDescription>
        <div className='flex items-center justify-between py-4'>
          <div className='flex'>
            <Input
              autoFocus
              placeholder='Wyszukaj nr. artykułu...'
              value={
                (table
                  .getColumn('articleNumber')
                  ?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table
                  .getColumn('articleNumber')
                  ?.setFilterValue(event.target.value)
              }
              className='mr-2 max-w-xs'
            />
            <Input
              placeholder='Wyszukaj klientów...'
              value={
                (table.getColumn('client')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('client')?.setFilterValue(event.target.value)
              }
              className='max-w-xs'
            />
          </div>
          <div className='flex'>
            <Link href='/capa/add'>
              <Button className='mr-2 justify-end' variant='outline'>
                <CopyPlus />
              </Button>
            </Link>
            <Button
              className='justify-end'
              variant='outline'
              onClick={() => revalidateCapa()}
            >
              <RefreshCcw />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowRight className='rotate-180 transform' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
