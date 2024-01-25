// 'use client';

// import { useState } from 'react';

// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Separator } from '@/components/ui/separator';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from '@/components/ui/card';
// import { Check, ChevronsUpDown } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from '@/components/ui/command';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';

// import ReworkTable from './ReworkTable';
// import { searchPositions, setReworkStatus } from '../actions';

// type Position = {
//   article: string;
//   status: string;
//   workplace: string;
//   type: string;
//   count: string;
// };

// export default function EditArticleConfig() {
//   const [isPendingSearching, setIsPendingSearching] = useState(false);
//   const [error, setError] = useState('');
//   const [isPendingSetting, setIsPendingSetting] = useState(false);
//   const [updated, setUpdated] = useState(0);
//   const [openArticle, setOpenArticle] = useState(false);

//   const search = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault(); // Prevent the default form submission behavior
//     setUpdated(0);
//     if (!searchTerm) {
//       setError('Brak wartości do wyszukania!');
//       return;
//     }
//     try {
//       setIsPendingSearching(true);
//       const search = await searchPositions(searchTerm);
//       console.log('search', search);
//       if (search.length === 0) {
//         setError('Nie znaleziono żadnej pozycji!');
//         return;
//       }
//       setError('');
//       setPositions(search);
//     } catch (error) {
//       console.error('There was an error searcihing:', error);
//     } finally {
//       setIsPendingSearching(false);
//     }
//   };

//   const markAsRework = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault(); // Prevent the default form submission behavior
//     if (!searchTerm) {
//       setError('Skontaktuj się z IT!');
//       return;
//     }
//     if (!reason) {
//       setError('Wprowadź powód!');
//       return;
//     }
//     if (reason.length < 20) {
//       setError('Powód musi mieć co najmniej 20 znaków!');
//       return;
//     }
//     try {
//       setIsPendingSetting(true);
//       const updated = await setReworkStatus(searchTerm, reason);
//       if (updated) {
//         setPositions([]);
//         setReason('');
//         setSearchTerm('');
//         setError('');
//         setUpdated(updated);
//       }
//     } catch (error) {
//       console.error('There was an error searcihing:', error);
//     } finally {
//       setIsPendingSetting(false);
//     }
//   };

//   return (
//     <Card className='w-[700px]'>
//       <CardHeader>
//         <CardTitle>Edycja konfiguracji artykułów</CardTitle>
//         {!error ? (
//           <CardDescription>
//             Wybierz artykuł z listy aby aby zmodyfikować jego konfigurację.
//           </CardDescription>
//         ) : (
//           <CardDescription className='text-red-700'>{error}</CardDescription>
//         )}
//       </CardHeader>
//       <CardContent>
//         <Popover
//           open={openArticle}
//           onOpenChange={setOpenArticle}
//           modal={true} // ???
//         >
//           <PopoverTrigger asChild>
//             <Button
//               variant='outline'
//               role='combobox'
//               aria-expanded={openArticle}
//               className='justify-between font-normal '
//             >
//               {selectedWorkplace
//                 ? selectedWorkplace.toUpperCase()
//                 : 'Wybierz...'}
//               <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className=' w-fit p-0'>
//             <Command>
//               <CommandInput placeholder='Wyszukaj...' />
//               <CommandEmpty>Nie znaleziono</CommandEmpty>
//               <CommandGroup className='max-h-48 overflow-y-auto'>
//                 {workplaces.map((workplace) => (
//                   <CommandItem
//                     key={workplace}
//                     value={workplace}
//                     onSelect={() => handleSelectWorkplace(workplace)}
//                     className='uppercase'
//                   >
//                     <Check
//                       className={cn(
//                         'mr-2 h-4 w-4',
//                         selectedWorkplace === workplace
//                           ? 'opacity-100'
//                           : 'opacity-0',
//                       )}
//                     />
//                     {workplace}
//                   </CommandItem>
//                 ))}
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//         {/* <form onSubmit={positions.length > 0 ? markAsRework : search}>
//           <div className='grid w-full items-center gap-4'>
//             {positions.length === 0 ? (
//               <>
//                 <div className='flex flex-col space-y-1.5'>
//                   <Label htmlFor='input'>DMC / batch hydra / paleta</Label>
//                   <Input
//                     type='text'
//                     placeholder='Wpisz dowolny...'
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <div className='flex justify-center'>
//                   {isPendingSearching ? (
//                     <Button disabled>
//                       <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                       Szukanie
//                     </Button>
//                   ) : (
//                     <Button type='submit'>Wyszukaj</Button>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <ReworkTable data={positions} />
//                 <Separator />
//                 <div className='grid w-full gap-1.5'>
//                   <Label htmlFor='message'>Powód</Label>
//                   <Textarea
//                     placeholder='Wprowadź krótki opis reworku.'
//                     id='reason'
//                     value={reason}
//                     className={reason.length >= 20 ? 'border-bruss' : ''}
//                     onChange={(e) => setReason(e.target.value)}
//                   />
//                 </div>
//                 <div className='flex justify-between'>
//                   <Button
//                     variant='destructive'
//                     type='button'
//                     onClick={() => {
//                       setPositions([]);
//                       setReason('');
//                       setSearchTerm('');
//                       setError('');
//                       setUpdated(0);
//                     }}
//                   >
//                     Wyczyść
//                   </Button>
//                   {isPendingSetting ? (
//                     <Button disabled>
//                       <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                       Zapisywanie
//                     </Button>
//                   ) : (
//                     <Button type='submit'>Oznacz jako rework</Button>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </form> */}
//       </CardContent>
//       {updated > 0 && (
//         <CardFooter className='font-bold text-bruss'>
//           Zaktualizowano pozycji: {updated}!
//         </CardFooter>
//       )}
//     </Card>
//   );
// }
