'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetOvenProcesses } from '../data/get-oven-processes';

export function ProcessesTable() {
  const {
    data: ovenProcesses,
    error: processesError,
    isLoading: isLoadingProcesses,
  } = useGetOvenProcesses();

  if (isLoadingProcesses) {
    return <div className='p-4'>Lade Ofenprozesse...</div>;
  }

  if (processesError) {
    return (
      <div className='p-4 text-red-500'>Fehler beim Laden der Ofenprozesse</div>
    );
  }

  return (
    <Card>
      <CardHeader>Oven Prozesse</CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artikelnummer</TableHead>
              <TableHead>Artikelname</TableHead>
              <TableHead>Temperatur (°C)</TableHead>
              <TableHead>Backzeit (min)</TableHead>
              <TableHead>Ofennummer</TableHead>
              <TableHead>Bediener</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ovenProcesses?.map((process) => (
              <TableRow key={`${process.articleNumber}-${process.ovenNumber}`}>
                <TableCell>{process.articleNumber}</TableCell>
                <TableCell>{process.articleName}</TableCell>
                <TableCell>{process.temp}</TableCell>
                <TableCell>{process.ovenTime / 60}</TableCell>
                <TableCell>{process.ovenNumber}</TableCell>
                <TableCell>
                  {process.operators?.length
                    ? process.operators.join(', ')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
            {(!ovenProcesses || ovenProcesses.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-muted-foreground text-center'
                >
                  Keine Ofenprozesse gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
