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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { warehouseSelectOptions } from '@/lib/options/warehouse';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  CircleX,
  RefreshCcw,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { revalidateDeviations } from '../actions';
import AddFailureDialog from '../components/add-failure-dialog';

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
  const [openWarehouse, setOpenWarehouse] = React.useState(false);
  // const [warehouseValue, setWarehouseValue] = React.useState('');

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
    <Card>
      <CardHeader>
        <CardTitle>Awarie LV2</CardTitle>
        <CardDescription>Ostatnia synchronizacja: {fetchTime}</CardDescription>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-1 sm:space-y-0'>
            {/* <Input
                  placeholder='id'
                  value={
                    (table.getColumn('_id')?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table.getColumn('_id')?.setFilterValue(event.target.value)
                  }
                  className='w-24'
                /> */}
            <Input
              placeholder='nr karty'
              className='w-24'
              value={searchParams.get('number') ?? ''}
              onChange={(e) => {
                router.push(
                  pathname + '?' + createQueryString('number', e.target.value),
                );
              }}
            />
            <Input
              placeholder='spisujący'
              className='w-24'
              value={searchParams.get('creator') ?? ''}
              onChange={(e) => {
                router.push(
                  pathname + '?' + createQueryString('creator', e.target.value),
                );
              }}
            />
            <Input
              placeholder='spisujący'
              className='w-24'
              value={searchParams.get('creator') ?? ''}
              onChange={(e) => {
                router.push(
                  pathname + '?' + createQueryString('creator', e.target.value),
                );
              }}
            />
            {/* <Input
                  placeholder='magazyn'
                  className='w-24'
                  value={searchParams.get('warehouse') ?? ''}
                  onChange={(e) => {
                    router.push(
                      pathname +
                        '?' +
                        createQueryString('warehouse', e.target.value),
                    );
                  }}
                /> */}
            <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  // aria-expanded={open}
                  className={cn(
                    'justify-between',
                    !searchParams.get('warehouse') && 'opacity-50',
                  )}
                >
                  {searchParams.get('warehouse')
                    ? warehouseSelectOptions.find(
                        (warehouse) =>
                          warehouse.value === searchParams.get('warehouse'),
                      )?.value
                    : 'magazyn'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-0'>
                <Command>
                  <CommandInput placeholder='wyszukaj...' />
                  <CommandList>
                    <CommandEmpty>Nie znaleziono.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key='reset'
                        onSelect={() => {
                          // setWarehouseValue('');
                          router.push(pathname);
                          setOpenWarehouse(false);
                        }}
                      >
                        <Check className='mr-2 h-4 w-4 opacity-0' />
                        nie wybrano
                      </CommandItem>
                      {warehouseSelectOptions.map((warehouse) => (
                        <CommandItem
                          key={warehouse.value}
                          value={warehouse.value}
                          onSelect={(currentValue) => {
                            // setWarehouseValue(
                            //   currentValue === warehouseValue
                            //     ? ''
                            //     : currentValue,
                            // );
                            router.push(
                              pathname +
                                '?' +
                                createQueryString(
                                  'warehouse',
                                  currentValue === searchParams.get('warehouse')
                                    ? ''
                                    : currentValue,
                                ),
                            );
                            setOpenWarehouse(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              searchParams.get('warehouse') === warehouse.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {warehouse.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              onClick={() => {
                // setWarehouseValue('');
                router.push(pathname);
              }}
              size='icon'
            >
              <CircleX />
            </Button>
            <Button
              variant='outline'
              onClick={() => revalidateDeviations()}
              size='icon'
            >
              <RefreshCcw />
            </Button>
            <AddFailureDialog />
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
