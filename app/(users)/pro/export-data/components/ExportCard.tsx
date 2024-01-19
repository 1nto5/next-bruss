'use client';

import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import config from '@/app/(persons)/pro/config';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function ExportCard() {
  const [openWorkplace, setOpenWorkplace] = useState(false);
  const [openArticle, setOpenArticle] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const [selectedWorkplace, setSelectedWorkplace] = useState<string | null>(
    null,
  );
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, setIsPending] = useState(false);

  const workplaces = Array.from(new Set(config.map((item) => item.workplace)));
  const filteredArticles = selectedWorkplace
    ? config.filter((item) => item.workplace === selectedWorkplace)
    : config;
  const statusOptions = [
    { label: 'box', value: 'box' },
    { label: 'paleta', value: 'pallet' },
    { label: 'magazyn', value: 'warehouse' },
  ];

  const handleSelectWorkplace = (workplace: string) => {
    setSelectedWorkplace(workplace);
    setOpenWorkplace(false);
  };

  const handleSelectArticle = (article: string) => {
    setSelectedArticle(article);
    setOpenArticle(false);
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
    setOpenStatus(false);
  };

  const getLabelForStatus = (status: string) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status,
    );
    return statusOption ? statusOption.label : 'Wybierz...';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSelectedWorkplace(null);
    setSelectedArticle(null);
    setSelectedStatus(null);
    setDate({ from: new Date(), to: addDays(new Date(), 3) });
    setSearchTerm('');
  };

  const generateExcel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = {
      workplace: selectedWorkplace,
      article: selectedArticle,
      status: selectedStatus,
      timeFrom: date?.from,
      timeTo: date?.to,
      searchTerm: searchTerm,
    };
    setIsPending(true);
    try {
      const response = await fetch('/api/generate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `exported-data.xlsx`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error('There was an error generating the Excel file:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>Eksport danych</CardTitle>
        <CardDescription>
          W przypadku szerokiego zakresu kryteriów, zostanie pobrane 10000
          najnowszych rekordów.
        </CardDescription>
      </CardHeader>
      <form onSubmit={generateExcel}>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='workplace'>Stanowisko</Label>
              <Popover
                open={openWorkplace}
                onOpenChange={setOpenWorkplace}
                modal={true} // ???
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openWorkplace}
                    className='justify-between font-normal '
                  >
                    {selectedWorkplace
                      ? selectedWorkplace.toUpperCase()
                      : 'Wybierz...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=' w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>Nie znaleziono</CommandEmpty>
                    <CommandGroup className='max-h-48 overflow-y-auto'>
                      {workplaces.map((workplace) => (
                        <CommandItem
                          key={workplace}
                          value={workplace}
                          onSelect={() => handleSelectWorkplace(workplace)}
                          className='uppercase'
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedWorkplace === workplace
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {workplace}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label htmlFor='article'>Artykuł</Label>
              <Popover
                open={openArticle}
                onOpenChange={setOpenArticle}
                modal={true} // ???
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openArticle}
                    className='justify-between font-normal'
                  >
                    {selectedArticle
                      ? (() => {
                          const foundArticle = filteredArticles.find(
                            (item) => item.article === selectedArticle,
                          );
                          return foundArticle
                            ? `${foundArticle.article} - ${foundArticle.name}`
                            : 'Wybierz...';
                        })()
                      : 'Wybierz...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>Nie znaleziono</CommandEmpty>
                    {/* Scroll working with: */}
                    <CommandGroup className='max-h-48 overflow-y-auto'>
                      {/* not with: */}
                      {/* <ScrollArea /> */}
                      {filteredArticles.map((article) => (
                        <CommandItem
                          key={article.article}
                          value={article.article}
                          onSelect={() => handleSelectArticle(article.article)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedArticle === article.article
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {`${article.article} - ${article.name}`}
                        </CommandItem>
                      ))}
                      {/* <ScrollArea /> */}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label htmlFor='status'>Status</Label>
              <Popover open={openStatus} onOpenChange={setOpenStatus}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openStatus}
                    className='justify-between font-normal'
                  >
                    {selectedStatus
                      ? getLabelForStatus(selectedStatus)
                      : 'Wybierz...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>Nie znaleziono</CommandEmpty>
                    <CommandGroup className='max-h-48 overflow-y-auto'>
                      {statusOptions.map((statusOption) => (
                        <CommandItem
                          key={statusOption.value}
                          onSelect={() =>
                            handleSelectStatus(statusOption.value)
                          }
                        >
                          {statusOption.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label htmlFor='date'>Zakres czasu</Label>
              {/* className in '' if needed */}
              <div className={cn('grid gap-2', '')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id='date'
                      variant={'outline'}
                      className={cn(
                        'justify-between font-normal',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='p-0' align='center'>
                    <Calendar
                      initialFocus
                      mode='range'
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
                <Label htmlFor='input'>DMC / batch hydra / paleta</Label>
                <Input
                  type='text'
                  placeholder='Wpisz dowolny...'
                  value={searchTerm}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='destructive' type='button' onClick={handleClear}>
            Wyczyść
          </Button>
          {isPending ? (
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Generowanie
            </Button>
          ) : (
            <Button type='submit'>Pobierz plik</Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
