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
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { ClipboardPen } from 'lucide-react';

type TableCellApproveRoleProps = {
  roleText: string;
  deviationUserRole: string | undefined;
  role: string;
  approved: boolean | undefined;
  handleApproval: () => void;
  by: string | undefined;
  at: string | undefined;
  lang: string;
};

const TableCellsApprove: React.FC<TableCellApproveRoleProps> = ({
  roleText,
  deviationUserRole,
  role,
  approved,
  handleApproval,
  by,
  at,
  lang,
}) => {
  return (
    <>
      <TableCell className='font-medium'>{roleText}</TableCell>

      <TableCell>
        {deviationUserRole === role && !approved && (
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
      <TableCell>{(by && extractNameFromEmail(by)) || '-'}</TableCell>
      <TableCell>{at ? new Date(at).toLocaleString(lang) : '-'}</TableCell>
    </>
  );
};

export default TableCellsApprove;
