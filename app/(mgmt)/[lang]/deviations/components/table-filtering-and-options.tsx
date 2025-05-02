'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Import Card components
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CircleX, Loader, Search } from 'lucide-react'; // Remove RefreshCw
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// Import useRef for initial mount check if needed, but direct navigation is simpler here
import { useEffect, useState } from 'react';
import { DeviationAreaType, DeviationReasonType } from '../lib/types';

export default function TableFilteringAndOptions({
  fetchTime, // Keep fetchTime prop for useEffect dependency
  isLogged,
  userEmail,
  areaOptions, // Add areaOptions prop
  reasonOptions, // Add reasonOptions prop
}: {
  fetchTime: Date;
  isLogged: boolean;
  userEmail?: string;
  areaOptions: DeviationAreaType[]; // Define type for areaOptions
  reasonOptions: DeviationReasonType[]; // Define type for reasonOptions
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const [showFilters, setShowFilters] = useState(() => {
    return !!(
      searchParams?.get('date') ||
      searchParams?.get('createdAt') ||
      searchParams?.get('status') ||
      searchParams?.get('area') || // Check for area param
      searchParams?.get('reason') // Check for reason param
    );
  });

  const [showOnlyMine, setShowOnlyMine] = useState(() => {
    const owner = searchParams?.get('owner');
    return owner === userEmail;
  });

  const [dateFilter, setDateFilter] = useState(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : undefined;
  });
  const [createdAtFilter, setRequestedAtFilter] = useState(() => {
    const createdAtParam = searchParams?.get('createdAt');
    return createdAtParam ? new Date(createdAtParam) : undefined;
  });
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get('status') || '',
  );
  // Add state for area and reason filters
  const [areaFilter, setAreaFilter] = useState(searchParams?.get('area') || '');
  const [reasonFilter, setReasonFilter] = useState(
    searchParams?.get('reason') || '',
  );

  // Function to build search params based on current state
  const buildSearchParams = (currentState: {
    date?: Date;
    createdAt?: Date;
    status: string;
    area: string;
    reason: string;
    owner?: string | null; // Use current showOnlyMine state
  }) => {
    const params = new URLSearchParams(); // Start fresh
    if (currentState.date) params.set('date', currentState.date.toISOString());
    if (currentState.createdAt)
      params.set('createdAt', currentState.createdAt.toISOString());
    if (currentState.status) params.set('status', currentState.status);
    if (currentState.area) params.set('area', currentState.area);
    if (currentState.reason) params.set('reason', currentState.reason);
    if (showOnlyMine && userEmail) params.set('owner', userEmail); // Use component state for owner
    return params;
  };

  // Handler for Select changes (triggers search immediately)
  const handleSelectChange = (
    filterType: 'status' | 'area' | 'reason',
    value: string,
  ) => {
    // Update local state first
    if (filterType === 'status')
      setStatusFilter(value); // Use value directly
    else if (filterType === 'area')
      setAreaFilter(value); // Use value directly
    else if (filterType === 'reason') setReasonFilter(value); // Use value directly

    // Build new params based on the change
    const params = buildSearchParams({
      date: dateFilter,
      createdAt: createdAtFilter,
      status: filterType === 'status' ? value : statusFilter, // Use value directly
      area: filterType === 'area' ? value : areaFilter, // Use value directly
      reason: filterType === 'reason' ? value : reasonFilter, // Use value directly
    });

    const newUrl = `${pathname}?${params.toString()}`;

    // Only push if URL changes
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    }
  };

  const handleClearFilters = () => {
    setDateFilter(undefined);
    setRequestedAtFilter(undefined);
    setStatusFilter('');
    setAreaFilter('');
    setReasonFilter('');
    setShowOnlyMine(false); // Also clear the 'only mine' toggle

    // Only push if there were existing params
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || ''); // Navigate to base path to clear params
    }
  };

  // Handler for the main "Search" button (primarily for date changes)
  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = buildSearchParams({
      date: dateFilter,
      createdAt: createdAtFilter,
      status: statusFilter,
      area: areaFilter,
      reason: reasonFilter,
    });

    const newUrl = `${pathname}?${params.toString()}`;

    // Only push or revalidate if the URL or parameters actually change
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    }
    // No revalidate needed here as push handles it
  };

  // Handler for "Show Only Mine" toggle (triggers search immediately)
  const handleShowOnlyMineChange = (checked: boolean) => {
    setShowOnlyMine(checked);
    // Build params reflecting the new 'owner' state
    const params = buildSearchParams({
      date: dateFilter,
      createdAt: createdAtFilter,
      status: statusFilter,
      area: areaFilter,
      reason: reasonFilter,
      // Temporarily override owner based on 'checked' for param building
      owner: checked ? userEmail : null,
    });

    // Update the owner param specifically based on 'checked'
    if (checked && userEmail) {
      params.set('owner', userEmail);
    } else {
      params.delete('owner');
    }

    const newUrl = `${pathname}?${params.toString()}`;
    setIsPendingSearch(true); // Start pending state immediately
    router.push(newUrl); // Trigger navigation
  };

  return (
    <Card>
      {' '}
      {/* Wrap filters in a Card */}
      <CardHeader className='p-4'>
        {' '}
        {/* Adjust padding */}
        <form onSubmit={handleSearchClick} className='flex flex-col gap-2'>
          <div className='flex items-center space-x-2'>
            <Switch
              id='show-filters'
              checked={showFilters}
              onCheckedChange={setShowFilters}
            />
            <Label htmlFor='show-filters'>Pokaż filtry</Label>
            {isLogged && (
              <>
                <Switch
                  id='only-my-requests'
                  checked={showOnlyMine}
                  onCheckedChange={handleShowOnlyMineChange}
                />
                <Label htmlFor='only-my-requests'>Tylko moje</Label>
              </>
            )}
          </div>
        </form>
      </CardHeader>
      {showFilters && (
        <CardContent className='p-4 pt-0'>
          {' '}
          {/* Adjust padding */}
          <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
            {' '}
            {/* Increase gap */}
            {/* Row 1: Status, Area, Reason */}
            <div className='flex flex-wrap items-end gap-4'>
              {' '}
              {/* Use items-end for alignment */}
              {/* Status Filter */}
              <div className='flex flex-col space-y-1'>
                {' '}
                {/* Stack label and select vertically */}
                <Label>Status</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('status', value)} // Use simplified handler
                  value={statusFilter}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='wybierz' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='in approval'>Oczekuje</SelectItem>
                    <SelectItem value='in progress'>Obowiązuje</SelectItem>
                    <SelectItem value='rejected'>Odrzucone</SelectItem>
                    <SelectItem value='draft'>Szkic</SelectItem>
                    <SelectItem value='closed'>Zamknięte</SelectItem>
                    <SelectItem value='approved'>Zatwierdzone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Area Filter */}
              <div className='flex flex-col space-y-1'>
                {' '}
                {/* Stack label and select vertically */}
                <Label>Obszar</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('area', value)} // Use simplified handler
                  value={areaFilter}
                >
                  <SelectTrigger className='w-[180px]'>
                    {' '}
                    {/* Adjust width as needed */}
                    <SelectValue placeholder='wybierz' />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.pl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Reason Filter */}
              <div className='flex flex-col space-y-1'>
                {' '}
                {/* Stack label and select vertically */}
                <Label>Powód</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('reason', value)} // Use simplified handler
                  value={reasonFilter}
                >
                  <SelectTrigger className='w-[180px]'>
                    {' '}
                    {/* Adjust width as needed */}
                    <SelectValue placeholder='wybierz' />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.pl}{' '}
                        {/* Assuming 'pl' is correct, was 'label' before */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Row 2: Dates and Action Buttons */}
            <div className='flex flex-wrap items-end gap-4'>
              {' '}
              {/* Use items-end for alignment */}
              {/* Date Filter */}
              <div className='flex flex-col space-y-1'>
                {' '}
                {/* Stack label and input vertically */}
                <Label>Termin odchylenia</Label>
                <DateTimePicker
                  value={dateFilter}
                  onChange={setDateFilter} // Only updates state
                  hideTime
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setDateFilter(x)} // Only updates state
                      format='dd/MM/yyyy'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className='w-[150px]' // Set width
                    />
                  )}
                />
              </div>
              {/* CreatedAt Filter */}
              <div className='flex flex-col space-y-1'>
                {' '}
                {/* Stack label and input vertically */}
                <Label>Data utworzenia</Label>
                <DateTimePicker
                  value={createdAtFilter}
                  onChange={setRequestedAtFilter} // Only updates state
                  hideTime
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setRequestedAtFilter(x)} // Only updates state
                      format='dd/MM/yyyy'
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className='w-[150px]' // Set width
                    />
                  )}
                />
              </div>
              {/* Buttons moved here */}
              <div className='flex gap-2'>
                <Button
                  type='submit' // Submits the form, triggering handleSearchClick
                  variant='secondary'
                  className='justify-start'
                  disabled={isPendingSearch}
                >
                  {isPendingSearch ? (
                    <>
                      <Loader className={'mr-1 animate-spin'} size={16} />{' '}
                      <span>Szukaj</span>
                    </>
                  ) : (
                    <>
                      <Search className='mr-1' size={16} /> <span>Szukaj</span>
                    </>
                  )}
                </Button>
                <Button
                  type='button' // Does not submit form
                  variant='destructive'
                  onClick={handleClearFilters} // Clears filters and navigates
                  title='Clear filters'
                  disabled={isPendingSearch} // Disable when searching
                >
                  <CircleX className='mr-1' size={16} /> <span>Wyczyść</span>
                </Button>
              </div>
            </div>
            {/* Buttons originally here are removed */}
          </form>
        </CardContent>
      )}
    </Card>
  );
}
