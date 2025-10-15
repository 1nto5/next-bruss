'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Department = {
  _id: string;
  value: string;
  name: string;
  namePl: string;
  nameDe: string;
  hourlyRate?: number;
  currency?: string;
};

export default function ForecastFiltering({
  fetchTime,
  isLogged,
}: {
  fetchTime: Date;
  isLogged: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const currentWeek = Math.ceil(
    ((currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) /
      86400000 +
      new Date(currentYear, 0, 1).getDay() +
      1) /
      7,
  );

  const [filterType, setFilterType] = useState(
    searchParams?.get('filterType') || 'week',
  );
  const [year, setYear] = useState(
    searchParams?.get('year') || currentYear.toString(),
  );
  const [startValue, setStartValue] = useState(
    searchParams?.get('startValue') || Math.max(1, currentWeek - 4).toString(),
  );
  const [endValue, setEndValue] = useState(
    searchParams?.get('endValue') ||
      (filterType === 'week'
        ? Math.min(52, currentWeek + 4).toString()
        : filterType === 'month'
          ? '12'
          : currentYear.toString()),
  );

  const [department, setDepartment] = useState(
    searchParams?.get('department') || 'all',
  );
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/overtime-orders/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const clearFilters = () => {
    setFilterType('week');
    setYear(currentYear.toString());
    setStartValue(Math.max(1, currentWeek - 4).toString());
    setEndValue(Math.min(52, currentWeek + 4).toString());
    setDepartment('all');

    const params = new URLSearchParams(searchParams?.toString());
    params.delete('filterType');
    params.delete('year');
    params.delete('startValue');
    params.delete('endValue');
    params.delete('department');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPendingSearch(true);

    const params = new URLSearchParams(searchParams?.toString());

    // Set filter parameters
    params.set('filterType', filterType);
    params.set('year', year);
    params.set('startValue', startValue);
    params.set('endValue', endValue);
    
    // Set department filter if selected
    if (department && department !== 'all') {
      params.set('department', department);
    } else {
      params.delete('department');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterTypeChange = (newFilterType: string) => {
    setFilterType(newFilterType);
    // Reset values based on filter type
    if (newFilterType === 'week') {
      setStartValue(Math.max(1, currentWeek - 4).toString());
      setEndValue(Math.min(52, currentWeek + 4).toString());
    } else if (newFilterType === 'month') {
      setStartValue('1');
      setEndValue('12');
    } else if (newFilterType === 'year') {
      setStartValue(currentYear.toString());
      setEndValue(currentYear.toString());
    }
  };

  const getMaxValue = () => {
    if (filterType === 'week') return 52;
    if (filterType === 'month') return 12;
    return currentYear + 10; // Allow up to 10 years in the future
  };

  const getMinValue = () => {
    if (filterType === 'year') return 2020; // Reasonable minimum year
    return 1;
  };

  const getPlaceholder = () => {
    if (filterType === 'week') return 'Numer tygodnia (1-52)';
    if (filterType === 'month') return 'Numer miesiąca (1-12)';
    return 'Rok';
  };

  return (
    <Card>
      <CardHeader className=''>
        <CardTitle>Zakres danych</CardTitle>
      </CardHeader>

      <CardContent className='space-y-4 pt-0'>
        <form onSubmit={handleSearchClick} className='space-y-4'>
          {/* Filter Type and Year Selection */}
          {filterType === 'year' ? (
            <div className='grid gap-2'>
              <Label htmlFor='filterType'>Typ agregacji</Label>
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Wybierz typ agregacji' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='week'>Tygodnie</SelectItem>
                  <SelectItem value='month'>Miesiące</SelectItem>
                  <SelectItem value='year'>Lata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='filterType'>Typ agregacji</Label>
                <Select
                  value={filterType}
                  onValueChange={handleFilterTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Wybierz typ agregacji' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='week'>Tygodnie</SelectItem>
                    <SelectItem value='month'>Miesiące</SelectItem>
                    <SelectItem value='year'>Lata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='year'>Rok</Label>
                <Input
                  id='year'
                  type='number'
                  min={2020}
                  max={currentYear + 10}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder='Rok'
                />
              </div>
            </div>
          )}

          {/* Department Filter */}
          <div className='grid gap-2'>
            <Label htmlFor='department'>Dział (opcjonalnie)</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder='Wszystkie działy' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value='all'>Wszystkie działy</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.namePl || dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Range Selection */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='startValue'>
                {filterType === 'week'
                  ? 'Od tygodnia'
                  : filterType === 'month'
                    ? 'Od miesiąca'
                    : 'Od roku'}
              </Label>
              <Input
                id='startValue'
                type='number'
                min={getMinValue()}
                max={getMaxValue()}
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                placeholder={getPlaceholder()}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='endValue'>
                {filterType === 'week'
                  ? 'Do tygodnia'
                  : filterType === 'month'
                    ? 'Do miesiąca'
                    : 'Do roku'}
              </Label>
              <Input
                id='endValue'
                type='number'
                min={getMinValue()}
                max={getMaxValue()}
                value={endValue}
                onChange={(e) => setEndValue(e.target.value)}
                placeholder={getPlaceholder()}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='grid grid-cols-2 gap-2'>
            <Button
              type='button'
              variant='destructive'
              onClick={clearFilters}
              title='Clear filters'
              disabled={isPendingSearch}
              className='w-full justify-center'
            >
              <CircleX className='mr-1' size={16} /> <span>Wyczyść</span>
            </Button>

            <Button
              type='submit'
              variant='secondary'
              className='w-full justify-center'
              disabled={isPendingSearch}
            >
              {isPendingSearch ? (
                <>
                  <Loader className='mr-1 animate-spin' size={16} />{' '}
                  <span>Zastosuj filtry</span>
                </>
              ) : (
                <>
                  <Search className='mr-1' size={16} />{' '}
                  <span>Zastosuj filtry</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
