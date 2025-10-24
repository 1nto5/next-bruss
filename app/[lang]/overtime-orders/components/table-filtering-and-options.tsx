'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { UsersListType } from '@/lib/types/user';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateOvertimeOrders as revalidate } from '../actions/utils';
import { Dictionary } from '../lib/dict';
import { DepartmentConfig } from '../lib/types';

export default function TableFilteringAndOptions({
  fetchTime,
  isGroupLeader,
  isLogged,
  userEmail,
  dict,
  departments,
  users,
  lang,
}: {
  fetchTime: Date;
  isGroupLeader: boolean;
  isLogged: boolean;
  userEmail?: string;
  dict: Dictionary;
  departments?: DepartmentConfig[];
  users: UsersListType;
  lang?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

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

  const [showPendingApproval, setShowPendingApproval] = useState(() => {
    const status = searchParams?.get('status');
    return status === 'pending';
  });

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    const statusParam = searchParams?.get('status');
    return statusParam ? statusParam.split(',') : [];
  });
  const [departmentFilter, setDepartmentFilter] = useState<string[]>(() => {
    const departmentParam = searchParams?.get('department');
    return departmentParam ? departmentParam.split(',') : [];
  });
  const [idFilter, setIdFilter] = useState(searchParams?.get('id') || '');
  const [createdByFilter, setCreatedByFilter] = useState<string[]>(() => {
    const createdByParam = searchParams?.get('createdBy');
    return createdByParam ? createdByParam.split(',') : [];
  });
  const [responsiblePersonFilter, setResponsiblePersonFilter] = useState<string[]>(() => {
    const responsiblePersonParam = searchParams?.get('responsiblePerson');
    return responsiblePersonParam ? responsiblePersonParam.split(',') : [];
  });

  // Sync showPendingApproval with statusFilter changes
  useEffect(() => {
    if (statusFilter.length === 1 && statusFilter[0] === 'pending') {
      setShowPendingApproval(true);
    } else if (statusFilter.length === 0 || !statusFilter.includes('pending')) {
      setShowPendingApproval(false);
    }
  }, [statusFilter]);

  const handleClearFilters = () => {
    setDateFilter(undefined);
    setStatusFilter([]);
    setDepartmentFilter([]);
    setIdFilter('');
    setCreatedByFilter([]);
    setResponsiblePersonFilter([]);
    setShowOnlyMine(false);
    setShowOnlyResponsible(false);
    setShowPendingApproval(false);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dateFilter) params.set('date', dateFilter.toISOString());
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (departmentFilter.length > 0) params.set('department', departmentFilter.join(','));
    if (idFilter) params.set('id', idFilter);
    if (createdByFilter.length > 0) params.set('createdBy', createdByFilter.join(','));
    if (responsiblePersonFilter.length > 0) params.set('responsiblePerson', responsiblePersonFilter.join(','));
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

  const handleShowPendingApprovalChange = (checked: boolean) => {
    setShowPendingApproval(checked);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (checked) {
      params.set('status', 'pending');
      setStatusFilter(['pending']);
    } else {
      params.delete('status');
      setStatusFilter([]);
    }
    setIsPendingSearch(true);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Check if any filter is active or if there are pending changes
  const hasActiveFilters = Boolean(
    dateFilter ||
    statusFilter.length > 0 ||
    departmentFilter.length > 0 ||
    idFilter ||
    createdByFilter.length > 0 ||
    responsiblePersonFilter.length > 0 ||
    showOnlyMine ||
    showOnlyResponsible ||
    showPendingApproval
  );

  // Check if local state differs from URL (pending changes to apply)
  const hasPendingChanges = (() => {
    const urlDate = searchParams?.get('date');
    const urlStatus = searchParams?.get('status')?.split(',') || [];
    const urlDepartment = searchParams?.get('department')?.split(',') || [];
    const urlId = searchParams?.get('id') || '';
    const urlCreatedBy = searchParams?.get('createdBy')?.split(',') || [];
    const urlResponsiblePerson = searchParams?.get('responsiblePerson')?.split(',') || [];

    const dateChanged = (dateFilter?.toISOString() || '') !== (urlDate || '');
    const statusChanged = JSON.stringify(statusFilter.sort()) !== JSON.stringify(urlStatus.sort());
    const departmentChanged = JSON.stringify(departmentFilter.sort()) !== JSON.stringify(urlDepartment.sort());
    const idChanged = idFilter !== urlId;
    const createdByChanged = JSON.stringify(createdByFilter.sort()) !== JSON.stringify(urlCreatedBy.sort());
    const responsiblePersonChanged = JSON.stringify(responsiblePersonFilter.sort()) !== JSON.stringify(urlResponsiblePerson.sort());

    return dateChanged || statusChanged || departmentChanged || idChanged || createdByChanged || responsiblePersonChanged;
  })();

  const canSearch = hasActiveFilters || hasPendingChanges;

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
            <div className='flex items-center space-x-2'>
              <Switch
                id='pending-approval'
                checked={showPendingApproval}
                onCheckedChange={handleShowPendingApprovalChange}
              />
              <Label htmlFor='pending-approval'>
                {dict.tableFiltering.pendingApproval}
              </Label>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className='p-4 pt-0'>
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {/* Row 1: ID, Status, Department */}
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
                <Label>{dict.tableFiltering.status}</Label>
                <MultiSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder={dict.common.select}
                  searchPlaceholder={dict.common.search}
                  emptyText={dict.tableFiltering.notFound}
                  clearLabel={dict.common.clear}
                  selectedLabel={dict.tableFiltering.selected}
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
                <MultiSelect
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                  placeholder={dict.common.select}
                  searchPlaceholder={dict.common.search}
                  emptyText={dict.tableFiltering.notFound}
                  clearLabel={dict.common.clear}
                  selectedLabel={dict.tableFiltering.selected}
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
                />
              </div>
            </div>

            {/* Row 2: Created By, Responsible Person, Deadline */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.tableFiltering.createdBy}</Label>
                <MultiSelect
                  value={createdByFilter}
                  onValueChange={setCreatedByFilter}
                  placeholder={dict.common.select}
                  searchPlaceholder={dict.tableFiltering.searchByName}
                  emptyText={dict.tableFiltering.notFound}
                  clearLabel={dict.common.clear}
                  selectedLabel={dict.tableFiltering.selected}
                  className='w-full'
                  options={
                    users?.map((user) => ({
                      value: user.email,
                      label: user.name,
                    })) || []
                  }
                />
              </div>
              <div className='flex flex-col space-y-1'>
                <Label>{dict.tableFiltering.responsiblePerson}</Label>
                <MultiSelect
                  value={responsiblePersonFilter}
                  onValueChange={setResponsiblePersonFilter}
                  placeholder={dict.common.select}
                  searchPlaceholder={dict.tableFiltering.searchByName}
                  emptyText={dict.tableFiltering.notFound}
                  clearLabel={dict.common.clear}
                  selectedLabel={dict.tableFiltering.selected}
                  className='w-full'
                  options={
                    users?.map((user) => ({
                      value: user.email,
                      label: user.name,
                    })) || []
                  }
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
            </div>

            {/* Row 3: Action buttons */}
            <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={handleClearFilters}
                title='Clear filters'
                disabled={isPendingSearch || !canSearch}
                className='order-2 w-full sm:order-1'
              >
                <CircleX /> <span>{dict.common.clear}</span>
              </Button>

              <Button
                type='submit'
                variant='secondary'
                disabled={isPendingSearch || !canSearch}
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
