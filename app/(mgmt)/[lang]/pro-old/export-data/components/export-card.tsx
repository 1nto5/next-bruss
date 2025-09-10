'use client';

import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

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
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cn';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

type articlesConfigType = {
  _id: string;
  workplace: string;
  articleNumber: string;
  articleName: string;
  articleNote: string;
  piecesPerBox: number;
  pallet: boolean;
  boxesPerPallet: number;
  dmc: string;
  dmcFirstValidation: string;
  secondValidation: boolean;
  dmcSecondValidation: string;
  hydraProcess: string;
  ford: boolean;
  bmw: boolean;
};

export default function ExportCard({
  cDict,
  articlesConfig,
}: {
  cDict: any;
  articlesConfig: articlesConfigType[];
}) {
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

  const workplaces = Array.from(
    new Set(articlesConfig.map((item) => item.workplace)),
  );
  const filteredArticles = selectedWorkplace
    ? articlesConfig.filter((item) => item.workplace === selectedWorkplace)
    : articlesConfig;
  const statusOptions = [
    { label: 'box', value: 'box' },
    { label: 'paleta', value: 'pallet' },
    { label: 'magazyn', value: 'warehouse' },
    { label: 'rework', value: 'rework' },
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
    return statusOption ? statusOption.label : cDict.chooseInputPlaceholder;
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

      console.log(response.status);
      if (response.status != 200) {
        toast.error(cDict.pleaseContactIt);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `DMCheck export (BRUSS).xlsx`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      toast.error(cDict.pleaseContactIt);
      console.error('There was an error generating the Excel file:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
        <CardDescription>{cDict.cardDescription}</CardDescription>
      </CardHeader>
      <form onSubmit={generateExcel}>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='workplace'>{cDict.workplaceLabel}</Label>
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
                    className='justify-between font-normal'
                  >
                    {selectedWorkplace
                      ? selectedWorkplace.toUpperCase()
                      : cDict.chooseInputPlaceholder}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>{cDict.emptyCommand}</CommandEmpty>
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
              <Label htmlFor='article'>{cDict.articleLabel}</Label>
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
                            (item) => item.articleNumber === selectedArticle,
                          );
                          return foundArticle
                            ? `${foundArticle.articleNumber} - ${foundArticle.articleName}`
                            : cDict.chooseInputPlaceholder;
                        })()
                      : cDict.chooseInputPlaceholder}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>{cDict.emptyCommand}</CommandEmpty>
                    {/* Scroll working with: */}
                    <CommandGroup className='max-h-48 overflow-y-auto'>
                      {/* not with: */}
                      {/* <ScrollArea /> */}
                      {filteredArticles.map((a) => (
                        <CommandItem
                          key={a.articleNumber}
                          value={a.articleNumber}
                          onSelect={() => handleSelectArticle(a.articleNumber)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedArticle === a.articleNumber
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {`${a.articleNumber} - ${a.articleName}`}
                        </CommandItem>
                      ))}
                      {/* <ScrollArea /> */}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label htmlFor='status'>{cDict.statusLabel}</Label>
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
                      : cDict.chooseInputPlaceholder}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>{cDict.emptyCommand}</CommandEmpty>
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
              <Label htmlFor='date'>{cDict.timeFrameLabel}</Label>
              {/* className in '' if needed */}
              <div className={cn('grid gap-2', '')}>
                <Label htmlFor='input'>DMC / batch hydra / paleta</Label>
                <Input
                  type='text'
                  placeholder={cDict.anyInputPlaceholder}
                  value={searchTerm}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='destructive' type='button' onClick={handleClear}>
            {cDict.clearButton}
          </Button>
          {isPending ? (
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {cDict.downloadingButton}
            </Button>
          ) : (
            <Button type='submit'>{cDict.downloadButton}</Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
