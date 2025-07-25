'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { AlarmClockPlus, ArrowRight, CircleX } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  id: string;
  status?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  id,
  status,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const shouldShowActions =
    status &&
    status !== 'closed' &&
    status !== 'draft' &&
    status !== 'rejected';

  // Filter out the actions column if status doesn't allow it
  const filteredColumns = React.useMemo(() => {
    if (shouldShowActions) {
      return columns;
    }
    return columns.filter((column) => column.id !== 'actions');
  }, [columns, shouldShowActions]);

  const table = useReactTable({
    data,
    columns: filteredColumns,
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

  const clearFilters = () => {
    setColumnFilters([]);
  };

  const firstNameFilter =
    (table.getColumn('firstName')?.getFilterValue() as string) || '';
  const lastNameFilter =
    (table.getColumn('lastName')?.getFilterValue() as string) || '';
  const identifierFilter =
    (table.getColumn('identifier')?.getFilterValue() as string) || '';
  const hasActiveFilters =
    firstNameFilter || lastNameFilter || identifierFilter;

  const shouldShowAddButton =
    status &&
    status !== 'closed' &&
    status !== 'draft' &&
    status !== 'rejected';

  return (
    <>
      <CardContent>
        <div className='mb-4 flex flex-wrap gap-2'>
          <div>
            <Input
              placeholder='imie'
              value={firstNameFilter}
              onChange={(event) =>
                table.getColumn('firstName')?.setFilterValue(event.target.value)
              }
              className='w-[150px]'
            />
          </div>
          <div>
            <Input
              placeholder='nazwisko'
              value={lastNameFilter}
              onChange={(event) =>
                table.getColumn('lastName')?.setFilterValue(event.target.value)
              }
              className='w-[150px]'
            />
          </div>
          <div>
            <Input
              placeholder='nr pers.'
              value={identifierFilter}
              onChange={(event) =>
                table
                  .getColumn('identifier')
                  ?.setFilterValue(event.target.value)
              }
              className='w-[150px]'
            />
          </div>
          <div>
            <Button
              variant='destructive'
              title='Clear filters'
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <CircleX /> <span>Wyczyść</span>
            </Button>
          </div>
          {shouldShowAddButton && (
            <div>
              <Link href={`/production-overtime/${id}/add-day-off`}>
                <Button variant='outline'>
                  <AlarmClockPlus /> <span>Dodaj odbiór</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

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
                    Brak wyników.
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
    </>
  );
}
