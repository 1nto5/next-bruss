'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useScanStore } from '../lib/stores';

export default function LastScansTable() {
  const { lastScans } = useScanStore();

  if (lastScans.length === 0) {
    return (
      <div className='text-center text-sm text-muted-foreground'>
        Brak ostatnich skanów
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='text-center'>Lp.</TableHead>
          <TableHead className='text-center'>DMC</TableHead>
          <TableHead className='text-center'>Czas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lastScans.map((scan, index) => (
          <TableRow key={index}>
            <TableCell className='text-center'>{index + 1}</TableCell>
            <TableCell className='text-center font-mono text-xs'>
              {scan.dmc}
            </TableCell>
            <TableCell className='text-center'>
              {new Date(scan.time).toLocaleTimeString('pl-PL')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}