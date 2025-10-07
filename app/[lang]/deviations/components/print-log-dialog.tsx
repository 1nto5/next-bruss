import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { PrintLogType } from '../lib/types';

interface PrintLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  logs: PrintLogType[];
  lang: string;
}

export default function PrintLogDialog({
  isOpen,
  onClose,
  logs,
  lang,
}: PrintLogDialogProps) {
  // Sort logs in reverse chronological order
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.printedAt).getTime();
    const dateB = new Date(b.printedAt).getTime();
    return dateB - dateA; // Most recent first
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Historia drukowania</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-96'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Osoba</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(log.printedAt).toLocaleString(process.env.DATE_TIME_LOCALE)}
                    </TableCell>
                    <TableCell>{extractNameFromEmail(log.printedBy)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className='text-muted-foreground text-center'
                  >
                    Brak zarejestrowanych wydruków
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
