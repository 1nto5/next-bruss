'use client';

import { ClearableCombobox } from '@/components/clearable-combobox';
import { ClearableSelect } from '@/components/clearable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvertimeOrders as revalidate } from '../actions';
import { Dictionary } from '../lib/dict';
import { DepartmentConfig } from '../lib/types';

export default function TableFilteringAndOptions({
  fetchTime,
  isGroupLeader,
  isLogged,
  userEmail,
  dict,
  departments,
  lang,
}: {
  fetchTime: Date;
  isGroupLeader: boolean;
  isLogged: boolean;
  userEmail?: string;
  dict: Dictionary;
  departments?: DepartmentConfig[];
  lang?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);


  const [showOnlyMine, setShowOnlyMine] = useState(() => {
    const requestedBy = searchParams?.get('requestedBy');
    return requestedBy === userEmail;
  });

  const [showOnlyResponsible, setShowOnlyResponsible] = useState(() => {
    const responsibleEmployee = searchParams?.get('responsibleEmployee');
    return responsibleEmployee === userEmail;
  });

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [requestedAtFilter, setRequestedAtFilter] = useState(() => {
    const requestedAtFilterParam = searchParams?.get('requestedAtFilter');
    return requestedAtFilterParam
      ? new Date(requestedAtFilterParam)
      : undefined;
  });
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams?.get('department') || '',
  );
  const [idFilter, setIdFilter] = useState(searchParams?.get('id') || '');

  const handleClearFilters = () => {
    setDateFilter(undefined);
    setRequestedAtFilter(undefined);
    setStatusFilter('');
    setDepartmentFilter('');
    setIdFilter('');
    setShowOnlyMine(false);
    setShowOnlyResponsible(false);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dateFilter) params.set('date', dateFilter.toISOString());
    if (requestedAtFilter)
      params.set('requestedAt', requestedAtFilter.toISOString());
    if (statusFilter) params.set('status', statusFilter);
    if (departmentFilter) params.set('department', departmentFilter);
    if (idFilter) params.set('id', idFilter);
    if (showOnlyMine) params.set('requestedBy', userEmail || '');
    if (showOnlyResponsible)
      params.set('responsibleEmployee', userEmail || '');
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  const handleShowOnlyMineChange = (checked: boolean) => {
    setShowOnlyMine(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('requestedBy', userEmail || '');
    } else {
      params.delete('requestedBy');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleShowOnlyResponsibleChange = (checked: boolean) => {
    setShowOnlyResponsible(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('responsibleEmployee', userEmail || '');
    } else {
      params.delete('responsibleEmployee');
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    dateFilter ||
    requestedAtFilter ||
    statusFilter ||
    departmentFilter ||
    idFilter
  );

  return (
    <Card>
      <CardHeader className='p-4'>
        {isLogged && (
          <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='only-my-requests'
                checked={showOnlyMine}
                onCheckedChange={handleShowOnlyMineChange}
              />
              <Label htmlFor='only-my-requests'>
                {dict.tableFiltering.myRequests}
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='only-responsible'
                checked={showOnlyResponsible}
                onCheckedChange={handleShowOnlyResponsibleChange}
              />
              <Label htmlFor='only-responsible'>
                {dict.tableFiltering.iAmResponsible}
              </Label>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: Status and Department */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.tableFiltering.status}</Label>
                <ClearableSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder={dict.common.select}
                  clearLabel={dict.common.clear}
                  className='w-full'
                  options={[
                    { value: 'forecast', label: 'Forecast' },
                    { value: 'pending', label: dict.tableColumns.statuses.pending },
                    { value: 'approved', label: dict.tableColumns.statuses.approved },
                    { value: 'canceled', label: dict.tableColumns.statuses.canceled },
                    { value: 'completed', label: dict.tableColumns.statuses.completed },
                    { value: 'accounted', label: dict.tableColumns.statuses.accounted },
                  ]}
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.department.label}</Label>
                <ClearableCombobox
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                  placeholder={dict.common.select}
                  searchPlaceholder={dict.common.search}
                  notFoundText={dict.department.unknown}
                  clearLabel={dict.common.clear}
                  className='w-full'
                  options={
                    departments?.map((dept) => ({
                      value: dept.value,
                      label:
                        lang === 'pl'
                          ? dept.namePl
                          : lang === 'de'
                          ? dept.nameDe
                          : dept.name,
                    })) || []
                  }
                  open={openDepartment}
                  onOpenChange={setOpenDepartment}
                />
              </div>
            </div>

            {/* Row 2: ID and Date filters */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='flex flex-col space-y-1'>
                <Label>ID</Label>
                <Input
                  value={idFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setIdFilter(e.target.value)
                  }
                  className='w-full'
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.tableFiltering.deadline}</Label>
                <DateTimePicker
                  value={dateFilter}
                  onChange={setDateFilter}
                  hideTime
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setDateFilter(x)}
                      format='dd/MM/yyyy'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className='w-full'
                    />
                  )}
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.tableFiltering.dateAdded}</Label>
                <DateTimePicker
                  value={requestedAtFilter}
                  onChange={setRequestedAtFilter}
                  hideTime
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setRequestedAtFilter(x)}
                      format='dd/MM/yyyy'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className='w-full'
                    />
                  )}
                />
              </div>
            </div>

            {/* Row 3: Action buttons */}
            <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={handleClearFilters}
                title='Clear filters'
                disabled={isPendingSearch || !hasActiveFilters}
                className='order-2 w-full sm:order-1'
              >
                <CircleX /> <span>{dict.common.clear}</span>
              </Button>

              <Button
                type='submit'
                variant='secondary'
                disabled={isPendingSearch || !hasActiveFilters}
                className='order-1 w-full sm:order-2'
              >
                {isPendingSearch ? (
                  <Loader className='animate-spin' />
                ) : (
                  <Search />
                )}
                <span>{dict.common.search}</span>
              </Button>
            </div>
          </form>
      </CardContent>
    </Card>
  );
}
