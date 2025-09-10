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
import { toast } from 'sonner';
import { deleteArticle } from '../actions';

export function DeleteDialog({
  isOpen,
  setIsOpen,
  articleId,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  articleId: string;
}) {
  const onDeleteArticle = async (articleId: string) => {
    try {
      const res = await deleteArticle(articleId);
      if (!res) {
        toast.error('Failed to delete article!');
      }
      if (res && res.error === 'not found') {
        toast.error('Article not found!');
      }
      if (res && res.success === 'deleted') {
        toast.success('Article deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete article!');
    }
  };
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete this article.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              if (articleId) {
                onDeleteArticle(articleId);
              } else {
                toast.error(`Article _id is missing. Please contact IT.`);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
