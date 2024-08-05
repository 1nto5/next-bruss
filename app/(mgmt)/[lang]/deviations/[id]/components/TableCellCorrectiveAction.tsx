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
import { ClipboardPen } from 'lucide-react';

type TableCellCorrectiveActionProps = {
  description: string;
  responsible: string;
  deadline: string | Date;
  done: boolean | undefined;
  handleApproval: () => void;
  lang: string;
};

const TableCellCorrectiveAction: React.FC<TableCellCorrectiveActionProps> = ({
  description,
  responsible,
  deadline,
  done,
  handleApproval,
  lang,
}) => {
  return (
    <>
      <TableCell>{description}</TableCell>

      <TableCell>
        {!done && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardPen />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>
                <AlertDialogDescription>
                  Czy na pewno chcesz zatwierdzić to odchylenie?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleApproval()}>
                  Zatwierdzam
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
      <TableCell>{extractNameFromEmail(responsible)}</TableCell>
      <TableCell>{new Date(deadline).toLocaleDateString(lang)}</TableCell>
      <TableCell>{done ? 'tak' : 'nie'}</TableCell>
    </>
  );
};

export default TableCellCorrectiveAction;
