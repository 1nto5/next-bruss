'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Card, CardContent } from '@/components/ui/card';
import { CircleX, Search, Loader } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Dictionary } from '../lib/dict';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from '../lib/types';
import { revalidateInventory } from '../actions/utils';

export default function TableFiltering({
  dict,
  lang,
  fetchTime,
}: {
  dict: Dictionary;
  lang: string;
  fetchTime: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(false);
  }, [fetchTime]);

  // Initialize state from URL params
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category') || [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.getAll('status') || [],
  );
  const [assignmentStatus, setAssignmentStatus] = useState<string>(
    searchParams.get('assignmentStatus') || 'all',
  );
  const [search, setSearch] = useState<string>(
    searchParams.get('search') || '',
  );
  const [purchaseDateFrom, setPurchaseDateFrom] = useState<Date | undefined>(
    searchParams.get('purchaseDateFrom')
      ? new Date(searchParams.get('purchaseDateFrom')!)
      : undefined,
  );
  const [purchaseDateTo, setPurchaseDateTo] = useState<Date | undefined>(
    searchParams.get('purchaseDateTo')
      ? new Date(searchParams.get('purchaseDateTo')!)
      : undefined,
  );
  const [assignmentDateFrom, setAssignmentDateFrom] = useState<Date | undefined>(
    searchParams.get('assignmentDateFrom')
      ? new Date(searchParams.get('assignmentDateFrom')!)
      : undefined,
  );
  const [assignmentDateTo, setAssignmentDateTo] = useState<Date | undefined>(
    searchParams.get('assignmentDateTo')
      ? new Date(searchParams.get('assignmentDateTo')!)
      : undefined,
  );

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();

    selectedCategories.forEach((cat) => params.append('category', cat));
    selectedStatuses.forEach((status) => params.append('status', status));

    if (assignmentStatus && assignmentStatus !== 'all') {
      params.set('assignmentStatus', assignmentStatus);
    }

    if (search) {
      params.set('search', search);
    }

    if (purchaseDateFrom) {
      params.set('purchaseDateFrom', purchaseDateFrom.toISOString());
    }

    if (purchaseDateTo) {
      params.set('purchaseDateTo', purchaseDateTo.toISOString());
    }

    if (assignmentDateFrom) {
      params.set('assignmentDateFrom', assignmentDateFrom.toISOString());
    }

    if (assignmentDateTo) {
      params.set('assignmentDateTo', assignmentDateTo.toISOString());
    }

    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsSearching(true);
      router.push(newUrl);
    } else {
      setIsSearching(true);
      revalidateInventory();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setAssignmentStatus('all');
    setSearch('');
    setPurchaseDateFrom(undefined);
    setPurchaseDateTo(undefined);
    setAssignmentDateFrom(undefined);
    setAssignmentDateTo(undefined);
    if (searchParams?.toString()) {
      setIsSearching(true);
      router.push(pathname || '');
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    assignmentStatus !== 'all' ||
    search !== '' ||
    purchaseDateFrom ||
    purchaseDateTo ||
    assignmentDateFrom ||
    assignmentDateTo;

  return (
    <Card>
      <CardContent className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex flex-col gap-4"
        >
          {/* Row 1: Search, Category, Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <Label>{dict.common.search}</Label>
              <Input
                placeholder="Asset ID, Serial Number, Model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.category}</Label>
              <MultiSelect
                options={EQUIPMENT_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: dict.categories[cat],
                }))}
                value={selectedCategories}
                onValueChange={setSelectedCategories}
                placeholder={dict.common.select}
                emptyText={dict.table.noResults}
                clearLabel={dict.common.clear}
                selectedLabel={dict.bulk.selected}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.status}</Label>
              <MultiSelect
                options={EQUIPMENT_STATUSES.map((status) => ({
                  value: status,
                  label: dict.statuses[status],
                }))}
                value={selectedStatuses}
                onValueChange={setSelectedStatuses}
                placeholder={dict.common.select}
                emptyText={dict.table.noResults}
                clearLabel={dict.common.clear}
                selectedLabel={dict.bulk.selected}
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Assignment Status, Purchase Date From, Purchase Date To */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.assignment}</Label>
              <Select
                value={assignmentStatus}
                onValueChange={setAssignmentStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {dict.filters.assignmentOptions.all}
                  </SelectItem>
                  <SelectItem value="assigned">
                    {dict.filters.assignmentOptions.assigned}
                  </SelectItem>
                  <SelectItem value="unassigned">
                    {dict.filters.assignmentOptions.unassigned}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.purchaseDateFrom}</Label>
              <DateTimePicker
                value={purchaseDateFrom}
                onChange={setPurchaseDateFrom}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setPurchaseDateFrom(x)}
                    format="dd/MM/yyyy"
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className="w-full"
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.purchaseDateTo}</Label>
              <DateTimePicker
                value={purchaseDateTo}
                onChange={setPurchaseDateTo}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setPurchaseDateTo(x)}
                    format="dd/MM/yyyy"
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>

          {/* Row 3: Assignment Date From, Assignment Date To */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.assignmentDateFrom}</Label>
              <DateTimePicker
                value={assignmentDateFrom}
                onChange={setAssignmentDateFrom}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setAssignmentDateFrom(x)}
                    format="dd/MM/yyyy"
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className="w-full"
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>{dict.filters.assignmentDateTo}</Label>
              <DateTimePicker
                value={assignmentDateTo}
                onChange={setAssignmentDateTo}
                hideTime
                renderTrigger={({ value, setOpen, open }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) => !open && setAssignmentDateTo(x)}
                    format="dd/MM/yyyy"
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>

          {/* Row 4: Action buttons */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              type="button"
              variant="destructive"
              onClick={clearFilters}
              disabled={!hasActiveFilters || isSearching}
              className="order-2 w-full sm:order-1"
            >
              <CircleX /> <span>{dict.common.clear}</span>
            </Button>

            <Button
              type="submit"
              variant="secondary"
              disabled={!hasActiveFilters || isSearching}
              className="order-1 w-full sm:order-2"
            >
              {isSearching ? <Loader className="animate-spin" /> : <Search />}
              <span>{dict.common.search}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
