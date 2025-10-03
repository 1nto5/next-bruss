'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OeeFilteringAndOptions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current mode from URL or default to 'range'
  const currentMode = searchParams?.get('mode') || 'range';

  // State for each mode
  const [mode, setMode] = useState(currentMode);
  const [isPendingSearch, setIsPendingSearch] = useState(false);

  // Reset pending state when search params change (navigation complete)
  useEffect(() => {
    setIsPendingSearch(false);
  }, [searchParams]);

  // Day mode
  const [dayDate, setDayDate] = useState<Date>(() => {
    const dateParam = searchParams?.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  });

  // Week mode
  const [weekYear, setWeekYear] = useState(() => {
    return parseInt(
      searchParams?.get('year') || new Date().getFullYear().toString(),
    );
  });
  const [weekNumber, setWeekNumber] = useState(() => {
    return parseInt(searchParams?.get('week') || '1');
  });

  // Month mode
  const [monthYear, setMonthYear] = useState(() => {
    return parseInt(
      searchParams?.get('year') || new Date().getFullYear().toString(),
    );
  });
  const [monthNumber, setMonthNumber] = useState(() => {
    return parseInt(
      searchParams?.get('month') ||
        (new Date().getMonth() + 1).toString(),
    );
  });

  // Range mode
  const [fromDate, setFromDate] = useState<Date>(() => {
    const fromParam = searchParams?.get('from');
    if (fromParam) return new Date(fromParam);
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    return defaultFrom;
  });

  const [toDate, setToDate] = useState<Date>(() => {
    const toParam = searchParams?.get('to');
    return toParam ? new Date(toParam) : new Date();
  });

  const handleClearFilters = () => {
    setMode('range');
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    setFromDate(defaultFrom);
    setToDate(new Date());
    setDayDate(new Date());
    setWeekYear(new Date().getFullYear());
    setWeekNumber(1);
    setMonthYear(new Date().getFullYear());
    setMonthNumber(new Date().getMonth() + 1);

    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPendingSearch(true);
    const params = new URLSearchParams();
    params.set('mode', mode);

    switch (mode) {
      case 'day':
        if (dayDate) {
          params.set('date', dayDate.toISOString().split('T')[0]);
        }
        break;
      case 'week':
        params.set('year', weekYear.toString());
        params.set('week', weekNumber.toString());
        break;
      case 'month':
        params.set('year', monthYear.toString());
        params.set('month', monthNumber.toString());
        break;
      case 'range':
        params.set('from', fromDate.toISOString().split('T')[0]);
        params.set('to', toDate.toISOString().split('T')[0]);
        break;
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate year options (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Generate week options (1-53)
  const weeks = Array.from({ length: 53 }, (_, i) => i + 1);

  // Month names
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSearchClick} className="flex flex-col gap-4">
          {/* Mode Selector */}
          <div>
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="range">Range</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Day Mode */}
          {mode === 'day' && (
            <div className="flex flex-col space-y-1">
              <Label>Select Date</Label>
              <DateTimePicker
                value={dayDate}
                onChange={(date) => setDayDate(date || new Date())}
                max={new Date()}
                hideTime={true}
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setDayDate(x || new Date())}
                    format="dd/MM/yyyy"
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className="w-full"
                  />
                )}
              />
            </div>
          )}

          {/* Week Mode */}
          {mode === 'week' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <Label>Year</Label>
                <Select
                  value={weekYear.toString()}
                  onValueChange={(v) => setWeekYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Week</Label>
                <Select
                  value={weekNumber.toString()}
                  onValueChange={(v) => setWeekNumber(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {weeks.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Month Mode */}
          {mode === 'month' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <Label>Year</Label>
                <Select
                  value={monthYear.toString()}
                  onValueChange={(v) => setMonthYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Month</Label>
                <Select
                  value={monthNumber.toString()}
                  onValueChange={(v) => setMonthNumber(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, idx) => (
                      <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Range Mode */}
          {mode === 'range' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <Label>From</Label>
                <DateTimePicker
                  value={fromDate}
                  onChange={(date) => setFromDate(date || new Date())}
                  max={toDate}
                  hideTime={true}
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setFromDate(x || new Date())}
                      format="dd/MM/yyyy"
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <Label>To</Label>
                <DateTimePicker
                  value={toDate}
                  onChange={(date) => setToDate(date || new Date())}
                  max={new Date()}
                  min={fromDate}
                  hideTime={true}
                  renderTrigger={({ value, setOpen, open }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && setToDate(x || new Date())}
                      format="dd/MM/yyyy"
                      disabled={open}
                      onCalendarClick={() => setOpen(!open)}
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Action buttons - Clear and Search */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearFilters}
              title="Clear filters"
              disabled={isPendingSearch}
              className="order-2 w-full sm:order-1"
            >
              <CircleX />
              <span>Clear</span>
            </Button>

            <Button
              type="submit"
              variant="secondary"
              disabled={isPendingSearch}
              className="order-1 w-full sm:order-2 sm:col-span-2"
            >
              {isPendingSearch ? (
                <Loader className="animate-spin" />
              ) : (
                <Search />
              )}
              <span>Search</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
