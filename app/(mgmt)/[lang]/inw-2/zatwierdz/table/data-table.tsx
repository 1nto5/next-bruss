'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import * as React from 'react';

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { revalidateDeviations } from '../actions';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchTime: string;
  lang: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchTime,
  lang,
}: DataTableProps<TData, TValue>) {
  useEffect(() => {
    const interval = setInterval(() => {
      revalidateDeviations();
    }, 1000 * 30); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <Tabs defaultValue='cards'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='cards'>Karty</TabsTrigger>
        <TabsTrigger value='positions'>Pozycje</TabsTrigger>
      </TabsList>
      <TabsContent value='cards'>
        <Card>
          <CardHeader>
            <CardTitle>Karty inwentaryzacja</CardTitle>
            <CardDescription>
              Ostatnia synchronizacja: {fetchTime}
            </CardDescription>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-1 sm:space-y-0'>
                <Input
                  placeholder='id'
                  value={
                    (table.getColumn('_id')?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table.getColumn('_id')?.setFilterValue(event.target.value)
                  }
                  className='w-24'
                />
                <Input
                  placeholder='test'
                  className='w-24'
                  onChange={(e) => {
                    // <pathname>?sort=asc
                    router.push(
                      pathname +
                        '?' +
                        createQueryString('test', e.target.value),
                    );
                  }}
                />
                <Input
                  placeholder='numer art.'
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
                  className='w-28'
                />
                <Input
                  placeholder='nazwa art.'
                  value={
                    (table
                      .getColumn('articleName')
                      ?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table
                      .getColumn('articleName')
                      ?.setFilterValue(event.target.value)
                  }
                  className='w-32'
                />
                {/* <Input
      placeholder='stanowisko'
      value={
        (table.getColumn('workplace')?.getFilterValue() as string) ?? ''
      }
      onChange={(event) =>
        table.getColumn('workplace')?.setFilterValue(event.target.value)
      }
      className='mr-2 max-w-xs'
    /> */}
              </div>
              <div className='flex items-center space-x-1'>
                <Button
                  variant='outline'
                  onClick={() => revalidateDeviations()}
                  size='icon'
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
      </TabsContent>
      <TabsContent value='positions'>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>test</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>test</CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
