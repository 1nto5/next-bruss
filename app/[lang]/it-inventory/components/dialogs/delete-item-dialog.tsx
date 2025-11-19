'use client';

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
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteItem } from '../../actions/crud';
import { Dictionary } from '../../lib/dict';
import { ITInventoryItem } from '../../lib/types';

export default function DeleteItemDialog({
  item,
  dict,
  lang,
  open,
  onOpenChange,
}: {
  item: ITInventoryItem;
  dict: Dictionary;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    toast.loading(dict.dialogs.delete.deleting);

    try {
      const result = await deleteItem(item._id);

      if ('error' in result) {
        toast.dismiss();
        toast.error(result.error);
        setIsDeleting(false);
        return;
      }

      toast.dismiss();
      toast.success(dict.dialogs.delete.deleted);
      onOpenChange(false);

      // Refresh the page to update the table
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(dict.toast.error);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dict.dialogs.delete.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {dict.dialogs.delete.description}
            <div className="mt-2 font-semibold">
              {item.assetId} - {item.manufacturer} {item.model}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {dict.dialogs.delete.cancelButton}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {dict.dialogs.delete.confirmButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
