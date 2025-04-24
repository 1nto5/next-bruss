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
  deviationUserRoles: string[];
  role: string;
  approved: boolean | undefined;
  handleApproval: () => void;
  by: string | undefined;
  at: string | undefined;
  lang: string;
  isPendingApproval: boolean;
};

const TableCellsApprove: React.FC<TableCellApproveRoleProps> = ({
  roleText,
  deviationUserRoles,
  role,
  approved,
  handleApproval,
  by,
  at,
  lang,
  isPendingApproval,
}) => {
  // Sprawdzamy, czy użytkownik ma wymaganą rolę wśród swoich ról
  const hasRole = deviationUserRoles.includes(role);

  return (
    <>
      <TableCell className='font-medium'>{roleText}</TableCell>

      <TableCell>
        {hasRole && !approved && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardPen
                  className={isPendingApproval ? 'animate-spin' : ''}
                />
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
      <TableCell className='whitespace-nowrap'>
        {(by && extractNameFromEmail(by)) || '-'}
      </TableCell>
      <TableCell>{at ? new Date(at).toLocaleString(lang) : '-'}</TableCell>
    </>
  );
};

export default TableCellsApprove;
