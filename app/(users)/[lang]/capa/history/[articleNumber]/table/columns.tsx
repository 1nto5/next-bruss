'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Trash2, Pencil } from 'lucide-react';
//TODO: implement or delete :)
// import { useHotkeys } from 'react-hotkeys-hook';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Capa = {
  client: string;
  line: string;
  articleNumber: string;
  articleName: string;
  clientPartNumber: string;
  piff: string;
  processDescription: string;
  rep160t?: string;
  rep260t?: string;
  rep260t2k?: string;
  rep300t?: string;
  rep300t2k?: string;
  rep400t?: string;
  rep500t?: string;
  b50?: string;
  b85?: string;
  engel?: string;
  eol?: string;
  cutter?: string;
  other?: string;
  soldCapa?: string;
  flex?: string;
  possibleMax?: string;
  comment?: string;
  sop?: string;
  eop?: string;
  service?: string;
  edited?: { date: string; email: string };
};

export const columns: ColumnDef<Capa>[] = [
  {
    accessorKey: 'edited.date',
    header: 'Data',
  },
  {
    accessorKey: 'edited.name',
    header: 'Autor',
  },
  {
    accessorKey: 'client',
    header: 'Klient',
  },
  {
    accessorKey: 'line',
    header: 'Linia',
  },
  {
    accessorKey: 'articleName',
    header: 'Nazwa art.',
  },
  {
    accessorKey: 'clientPartNumber',
    header: 'Numer części klienta',
  },
  {
    accessorKey: 'piff',
    header: 'Piff',
  },
  {
    accessorKey: 'processDescription',
    header: 'Opis procesu',
  },
  {
    accessorKey: 'rep160t',
    header: 'REP 160T',
  },
  {
    accessorKey: 'rep260t',
    header: 'REP 260t',
  },
  {
    accessorKey: 'rep260t2k',
    header: 'REP 260T 2K',
  },
  {
    accessorKey: 'rep300t',
    header: 'REP 300T',
  },
  {
    accessorKey: 'rep300t2k',
    header: 'REP 300T 2K',
  },
  {
    accessorKey: 'rep400t',
    header: 'REP 400T',
  },
  {
    accessorKey: 'rep500t',
    header: 'REP 500T',
  },
  {
    accessorKey: 'b50',
    header: 'B50',
  },
  {
    accessorKey: 'b85',
    header: 'B85',
  },
  {
    accessorKey: 'engel',
    header: 'ENGEL',
  },
  {
    accessorKey: 'eol',
    header: 'EOL',
  },
  {
    accessorKey: 'cutter',
    header: 'Obcinarki',
  },
  {
    accessorKey: 'other',
    header: 'Inne',
  },
  {
    accessorKey: 'soldCapa',
    header: 'Sprzedana CAPA',
  },
  {
    accessorKey: 'flex',
    header: 'Flex?',
  },
  {
    accessorKey: 'possibleMax',
    header: 'Możliwa MAX Capa',
  },
  {
    accessorKey: 'comment',
    header: 'Komentarz',
  },
  {
    accessorKey: 'sop',
    header: 'SOP',
  },
  {
    accessorKey: 'eop',
    header: 'EOP',
  },
  {
    accessorKey: 'service',
    header: 'Czy serwisowy?',
  },
];
