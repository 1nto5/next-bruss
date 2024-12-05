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
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { failuresOptions, stationsOptions } from '@/lib/options/failures-lv2';
import { cn } from '@/lib/utils';
import { se } from 'date-fns/locale';
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  CircleX,
  RefreshCcw,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { revalidateFailures } from '../actions';
import AddFailureDialog from '../components/add-failure-dialog';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchTime: string;
  // lang: string;
  // session: Session | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchTime,
  // lang,
  // session,
}: DataTableProps<TData, TValue>) {
  // useEffect(() => {
  //   const interval = setInterval(
  //     () => {
  //       revalidateFailures();
  //     },
  //     1000 * 60 * 10, // 10 minutes
  //   );

  //   return () => clearInterval(interval);
  // }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [openStation, setOpenStation] = React.useState(false);
  const [openFailure, setOpenFailure] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fromValue, setFromValue] = React.useState(
    searchParams.get('from') || '',
  );
  const [toValue, setToValue] = React.useState(searchParams.get('to') || '');

  React.useEffect(() => {
    setFromValue(searchParams.get('from') || '');
    setToValue(searchParams.get('to') || '');
  }, [searchParams]); // Aktualizacja stanu, gdy zmienią się parametry w URL

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

  const filteredFailures =
    failuresOptions.find(
      (option) => option.station === searchParams.get('station'),
    )?.options || [];

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
        <CardTitle>Awarie LV</CardTitle>
        <CardDescription>Ostatnia synchronizacja: {fetchTime}</CardDescription>

        <div className='flex flex-wrap gap-1'>
          <Popover open={openStation} onOpenChange={setOpenStation}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                // aria-expanded={open}
                className={cn(
                  'justify-between',
                  !searchParams.get('station') && 'opacity-50',
                )}
              >
                {searchParams.get('station')
                  ? stationsOptions.find(
                      (station) => station === searchParams.get('station'),
                    )
                  : 'stacja'}
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
                        setOpenStation(false);
                      }}
                    >
                      <Check className='mr-2 h-4 w-4 opacity-0' />
                      nie wybrano
                    </CommandItem>
                    {stationsOptions.map((station) => (
                      <CommandItem
                        key={station}
                        value={station}
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
                                'station',
                                currentValue === searchParams.get('station')
                                  ? ''
                                  : currentValue,
                              ),
                          );
                          setOpenStation(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            searchParams.get('station') === station
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {station}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={openFailure} onOpenChange={setOpenFailure}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                disabled={!searchParams.get('station')}
                // aria-expanded={open}
                className={cn(
                  'justify-between',
                  !searchParams.get('failure') && 'opacity-50',
                )}
              >
                {searchParams.get('failure')
                  ? filteredFailures.find(
                      (failure) => failure === searchParams.get('failure'),
                    )
                  : 'awaria'}
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
                        setOpenFailure(false);
                      }}
                    >
                      <Check className='mr-2 h-4 w-4 opacity-0' />
                      nie wybrano
                    </CommandItem>
                    {filteredFailures.map((failure) => (
                      <CommandItem
                        key={failure}
                        value={failure}
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
                                'failure',
                                currentValue === searchParams.get('failure')
                                  ? ''
                                  : currentValue,
                              ),
                          );
                          setOpenFailure(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            searchParams.get('failure') === failure
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {failure}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className='flex items-center gap-1.5'>
            <Label htmlFor='from'>Od:</Label>
            <Input
              id='from'
              type='date'
              className='w-36'
              // defaultValue={searchParams.get('from') || ''}
              value={fromValue.split('T')[0] || ''}
              onChange={(e) => {
                router.push(
                  pathname + '?' + createQueryString('from', e.target.value),
                );
              }}
            />
            <Input
              type='time'
              // defaultValue={searchParams.get('from') || ''}
              value={fromValue.split('T')[1]?.slice(0, 5) || ''}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const fromParam = searchParams.get('from'); // Pobieramy wartość 'from'
                const currentFrom = fromParam
                  ? new Date(fromParam)
                  : new Date(); // Walidacja wartości

                if (!isNaN(hours) && !isNaN(minutes)) {
                  const updatedFrom = new Date(
                    currentFrom.getFullYear(),
                    currentFrom.getMonth(),
                    currentFrom.getDate(),
                    hours,
                    minutes,
                  );

                  if (!isNaN(updatedFrom.getTime())) {
                    router.push(
                      pathname +
                        '?' +
                        createQueryString('from', updatedFrom.toISOString()),
                    );
                  }
                }
              }}
            />
          </div>
          <div className='flex items-center gap-1.5'>
            <Label htmlFor='to'>Do:</Label>
            <Input
              id='to'
              type='date'
              className='w-36'
              // defaultValue={searchParams.get('to') || ''}
              value={toValue.split('T')[0] || ''}
              onChange={(e) => {
                router.push(
                  pathname + '?' + createQueryString('to', e.target.value),
                );
              }}
            />
            <Input
              type='time'
              // defaultValue={searchParams.get('to') || ''}
              value={toValue.split('T')[1]?.slice(0, 5) || ''}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const toParam = searchParams.get('to');
                const currentTo = toParam ? new Date(toParam) : new Date();
                if (!isNaN(hours) && !isNaN(minutes)) {
                  const updatedTo = new Date(
                    currentTo.getFullYear(),
                    currentTo.getMonth(),
                    currentTo.getDate(),
                    hours,
                    minutes,
                  );

                  if (!isNaN(updatedTo.getTime())) {
                    router.push(
                      pathname +
                        '?' +
                        createQueryString('to', updatedTo.toISOString()),
                    );
                  }
                }
              }}
            />
          </div>
          <Input
            placeholder='nadzorujący'
            className='w-auto'
            value={searchParams.get('supervisor') ?? ''}
            onChange={(e) => {
              router.push(
                pathname +
                  '?' +
                  createQueryString('supervisor', e.target.value),
              );
            }}
          />
          <Input
            placeholder='odpowiedzialny'
            className='w-36'
            value={searchParams.get('responsible') ?? ''}
            onChange={(e) => {
              router.push(
                pathname +
                  '?' +
                  createQueryString('responsible', e.target.value),
              );
            }}
          />

          <Button
            variant='outline'
            onClick={() => {
              router.push(pathname);
            }}
            size='icon'
            title='wyczyść filtry'
          >
            <CircleX />
          </Button>
          <div className='ml-auto flex gap-1'>
            <Button
              variant='outline'
              onClick={() => revalidateFailures()}
              size='icon'
              title='odśwież'
            >
              <RefreshCcw />
            </Button>
            {/* {session && session.user?.roles.includes('failures-lv2') && ( */}
            <AddFailureDialog />
            {/* )} */}
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
    </Card>
  );
}
