'use client';

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

// import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// import { ArrowRight } from 'lucide-react';
// import { useEffect } from 'react';
// import { revalidateCardPositions as revalidate } from '../actions';
import CardPositionsTableFilteringAndOptions from '../components/card-positions-table-filtering-and-options';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchTime: string;
  lang: string;
  cardNumber: string;
  cardWarehouse: string;
  cardSector: string;
  cardCreators: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchTime,
  lang,
  cardNumber,
  cardWarehouse,
  cardSector,
  cardCreators,
}: DataTableProps<TData, TValue>) {
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     revalidate();
  //   }, 1000 * 30); // 30 seconds

  //   return () => clearInterval(interval);
  // }, []);
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
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pozycje na karcie: {cardNumber}</CardTitle>
        <CardDescription className='font-bold'>
          Magazyn: {cardWarehouse}, sektor: {cardSector}, twórcy:{' '}
          {cardCreators.join(', ')}
        </CardDescription>
        <CardDescription>Ostatnia synchronizacja: {fetchTime}</CardDescription>
        <CardPositionsTableFilteringAndOptions
          setFilter={(columnId, value) =>
            table.getColumn(columnId)?.setFilterValue(value)
          }
        />
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
        {/* <Button
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
        </Button> */}
      </CardFooter>
    </Card>
  );
}
