import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { ClipboardCheck } from 'lucide-react';

type TableCellCorrectiveActionProps = {
  description: string;
  responsible: string;
  deadline: string | Date;
  executedAt?: string | Date;
  handle: () => void;
  lang: string;
  user?: string;
};

const TableCellCorrectiveAction: React.FC<TableCellCorrectiveActionProps> = ({
  description,
  responsible,
  deadline,
  executedAt,
  handle,
  lang,
  user,
}) => {
  return (
    <>
      <TableCell>{description}</TableCell>

      <TableCell>
        {!executedAt && responsible === user && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardCheck />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>
                <AlertDialogDescription>
                  Czy wybrana akcja korygująca została wykonana?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={() => handle()}>
                  Potwierdź
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
      <TableCell>{extractNameFromEmail(responsible)}</TableCell>
      <TableCell>{new Date(deadline).toLocaleDateString(lang)}</TableCell>
      <TableCell>
        {executedAt ? new Date(executedAt).toLocaleString(lang) : '-'}
      </TableCell>
    </>
  );
};

export default TableCellCorrectiveAction;
