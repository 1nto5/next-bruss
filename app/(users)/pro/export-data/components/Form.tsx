'use client';

import { SetStateAction, useState } from 'react';
import Select from './Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import config from '@/app/(persons)/pro/config';
import clsx from 'clsx';
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
import { Loader2, Scroll } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

// TODO: match styles (Select, input, datapicker) with the rest of the app in dark and light, make it responsive and format width datapicker
// TODO: width data selector

export default function Form() {
  const [openWorkplace, setOpenWorkplace] = useState(false);
  const [openArticle, setOpenArticle] = useState(false);

  const [selectedWorkplace, setSelectedWorkplace] = useState<string | null>(
    null,
  );
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [timeFrom, setTimeFrom] = useState<Date | null>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [timeTo, setTimeTo] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleClear = () => {
    setSelectedWorkplace(null);
    setSelectedArticle(null);
    setSelectedStatus(null);
    setTimeFrom(null);
    setTimeTo(null);
    setSearchTerm('');
  };

  const generateExcel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = {
      workplace: selectedWorkplace,
      article: selectedArticle,
      status: selectedStatus,
      timeFrom: timeFrom,
      timeTo: timeTo,
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

      // Create a Blob from the response
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
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Eksport danych</CardTitle>
        <CardDescription className='text-red-700'>
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <form onSubmit={generateExcel}>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='workplace'>Stanowisko</Label>
              <Popover open={openWorkplace} onOpenChange={setOpenWorkplace}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openWorkplace}
                    className='justify-between'
                  >
                    {selectedWorkplace
                      ? selectedWorkplace.toUpperCase()
                      : 'Wybierz...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj...' />
                    <CommandEmpty>Nie znaleziono.</CommandEmpty>
                    <CommandGroup>
                      {workplaces.map((workplace) => (
                        <CommandItem
                          key={workplace}
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
                modal={true}
                open={openArticle}
                onOpenChange={setOpenArticle}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openArticle}
                    className='justify-between'
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
                <PopoverContent className='p-0'>
                  <Command>
                    <CommandInput placeholder='Wyszukaj artykuł...' />
                    <ScrollArea className='h-12' />
                    <CommandEmpty>Nie znaleziono.</CommandEmpty>
                    <CommandGroup>
                      {filteredArticles.map((article) => (
                        <CommandItem
                          key={article.article}
                          onSelect={() => handleSelectArticle(article.article)}
                          className='uppercase'
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
                    </CommandGroup>
                    <ScrollArea />
                  </Command>
                </PopoverContent>
              </Popover>
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
              Trwa generowanie
            </Button>
          ) : (
            <Button type='submit'>Pobierz plik</Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

//   return (
//     <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
//       <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
//         wybór kryteriów exportu
//       </span>
//       <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
//         <form className='flex w-11/12 flex-col gap-3' onSubmit={generateExcel}>
//           <Select
//             options={workplaces.map((workplace) => ({
//               label: workplace.toUpperCase(),
//               value: workplace,
//             }))}
//             value={
//               workplaces.find((workplace) => workplace === selectedWorkplace)
//                 ? {
//                     label:
//                       selectedWorkplace &&
//                       (selectedWorkplace as String).toUpperCase(),
//                     value: selectedWorkplace,
//                   }
//                 : null
//             }
//             onChange={(option: { value: SetStateAction<null> }) => {
//               if (option) {
//                 setSelectedWorkplace(option.value);
//                 setSelectedArticle(null);
//               } else {
//                 setSelectedWorkplace(null);
//                 setSelectedArticle(null);
//               }
//             }}
//             placeholder='stanowisko'
//           />

//           <Select
//             options={filteredArticles.map((article) => ({
//               label: `${article.name} (${article.article})`,
//               value: article.article,
//             }))}
//             value={
//               filteredArticles.find(
//                 (article) => article.article === selectedArticle,
//               )
//                 ? {
//                     label: `${
//                       filteredArticles.find(
//                         (article) => article.article === selectedArticle,
//                       )?.name
//                     } (${selectedArticle})`,
//                     value: selectedArticle,
//                   }
//                 : null
//             }
//             onChange={(option: { value: SetStateAction<null> }) => {
//               if (option) {
//                 setSelectedArticle(option.value);
//               } else {
//                 setSelectedArticle(null);
//               }
//             }}
//             placeholder='artykuł'
//           />

//           <Select
//             options={statusOptions}
//             value={
//               statusOptions.find((option) => option.value === selectedStatus)
//                 ? {
//                     label: statusOptions.find(
//                       (option) => option.value === selectedStatus,
//                     )?.label,
//                     value: selectedStatus,
//                   }
//                 : null
//             }
//             onChange={(option: { value: SetStateAction<null> }) => {
//               if (option) {
//                 setSelectedStatus(option.value);
//               } else {
//                 setSelectedStatus(null);
//               }
//             }}
//             placeholder='status'
//           />

//           <div className='flex justify-center space-x-2'>
//             <div className='flex flex-col items-center'>
//               <label className='mb-1 text-sm text-slate-700 dark:text-slate-300'>
//                 data od:
//               </label>
//               <DatePicker
//                 selected={timeFrom}
//                 onChange={(date) => setTimeFrom(date)}
//                 className='rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900'
//                 showTimeSelect
//                 timeIntervals={15}
//                 dateFormat='P HH:mm'
//                 timeFormat='HH:mm'
//               />
//             </div>
//             <div className='flex flex-col items-center'>
//               <label className='mb-1 text-sm text-slate-700 dark:text-slate-300'>
//                 data do:
//               </label>
//               <DatePicker
//                 selected={timeTo}
//                 onChange={(date) => setTimeTo(date)}
//                 className='rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900'
//                 showTimeSelect
//                 timeIntervals={15}
//                 dateFormat='P HH:mm'
//                 timeFormat='HH:mm'
//               />
//             </div>
//           </div>
//           <input
//             type='text'
//             className='items-center rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900'
//             placeholder='wyszukaj DMC / hydra batch / pallet batch'
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <button
//             type='submit'
//             className={clsx(
//               `w-full rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss`,
//               { 'animate-pulse': isPending === true },
//             )}
//           >
//             {!isPending ? 'pobierz excel' : 'generowanie'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
