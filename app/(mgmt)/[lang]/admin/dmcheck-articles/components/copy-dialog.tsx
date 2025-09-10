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
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyArticle } from '../actions';

export function CopyDialog({
  isOpen,
  setIsOpen,
  articleId,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  articleId: string;
}) {
  const [workplaces, setWorkplaces] = useState('');
  const handleCopy = async (articleId: string) => {
    try {
      const res = await copyArticle(articleId, workplaces);
      if (!res) {
        toast.error('Failed to copy article!');
      }
      if (res && res.error === 'not found') {
        toast.error('Article not found!');
      }
      if (res && res.success === 'copied') {
        toast.success('Article/s copied successfully!');
      }
    } catch (error) {
      toast.error('Failed to copy article!');
    }
  };
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Copy the article</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter the workplace or workplaces where you want to copy the
            article.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          id='workplaces'
          onChange={(event) => setWorkplaces(event.target.value)}
          placeholder='eol74, eol32, eol12'
        />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              if (articleId) {
                handleCopy(articleId);
              } else {
                toast.error(`Article _id is missing. Please contact IT.`);
              }
            }}
          >
            Copy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
