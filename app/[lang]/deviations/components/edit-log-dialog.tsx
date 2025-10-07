'use client';

import { EditLogEntryType } from '@/app/[lang]/deviations/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/name-format';

// Helper to format values for display
const formatValue = (value: any, lang?: string): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Tak' : 'Nie';

  // Handle Date objects
  if (value instanceof Date) return value.toLocaleDateString(lang);

  // Handle date strings - try to detect date format
  if (typeof value === 'string') {
    // Check if it's a date string (ISO format)
    if (/^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        // Validate that it's a valid date
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(lang);
        }
      } catch {
        // Fall through to default handling
      }
    }
  }

  // Special handling for date objects that might not be instanceof Date
  if (
    typeof value === 'object' &&
    value !== null &&
    'getMonth' in value &&
    typeof value.getMonth === 'function'
  ) {
    try {
      return value.toLocaleDateString(lang);
    } catch {
      // Fall through to default handling
    }
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Optional: Polish translations for field names
const fieldNameTranslations: Record<string, string> = {
  articleNumber: 'Numer artykułu',
  articleName: 'Nazwa artykułu',
  workplace: 'Stanowisko',
  customerNumber: 'Numer klienta',
  customerName: 'Nazwa klienta',
  quantity: 'Ilość',
  unit: 'Jednostka',
  charge: 'Partia',
  reason: 'Powód',
  periodFrom: 'Okres od',
  periodTo: 'Okres do',
  area: 'Obszar',
  description: 'Opis',
  processSpecification: 'Specyfikacja procesu',
  customerAuthorization: 'Autoryzacja klienta',
};

export default function EditLogDialog({
  isOpen,
  onClose,
  logs,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  logs: EditLogEntryType[];
  lang: string;
}) {
  // Sort logs by date descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[768px]'>
        <DialogHeader>
          <DialogTitle>Historia zmian</DialogTitle>
          {/* <DialogDescription>
            Lista zmian wprowadzonych w polach odchylenia.
            </DialogDescription> */}
        </DialogHeader>
        {/* <ScrollArea className='h-[300px]'> */}
        <div className='h-[300px] overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Osoba</TableHead>
                <TableHead>Pole</TableHead>
                <TableHead>Poprzednia wartość</TableHead>
                <TableHead>Nowa wartość</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className='whitespace-nowrap'>
                      {new Date(log.changedAt).toLocaleString(lang)}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {extractNameFromEmail(log.changedBy)}
                    </TableCell>
                    <TableCell>
                      {fieldNameTranslations[log.fieldName] || log.fieldName}
                    </TableCell>
                    <TableCell>{formatValue(log.oldValue, lang)}</TableCell>
                    <TableCell>{formatValue(log.newValue, lang)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-muted-foreground text-center'
                  >
                    Brak historii zmian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* </ScrollArea> */}
        {/* <DialogFooter>
          <Button variant='outline' onClick={onClose}>
          Zamknij
          </Button>
          </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
