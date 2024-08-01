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
import { TableCell, TableRow } from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

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
              <Button type='button' variant='outline'>
                Zatwierdź
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
