'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pin, PinOff, Edit, Trash, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { deleteNews, togglePin } from '../actions';
import { toast } from 'sonner';
import { NewsType } from '../lib/types';
import { useState } from 'react';
import { extractNameFromEmail } from '@/lib/utils/name-format';

interface NewsCardProps {
  news: NewsType;
  isAdmin: boolean;
  lang: string;
  dict: any;
}

export function NewsCard({ news, isAdmin, lang, dict }: NewsCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteNews(news._id);
      if (result.success) {
        toast.success(dict.news.messages[result.success] || result.success);
      } else if (result.error) {
        toast.error(result.error === 'unauthorized' ? dict.news.messages.unauthorized : dict.news.messages[result.error] || result.error);
      }
    } catch (error) {
      console.error('handleDelete error:', error);
      toast.error(dict.news.messages.deleteErrorGeneric);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  const handleTogglePin = async () => {
    setIsToggling(true);
    try {
      const result = await togglePin(news._id, !news.isPinned);
      if (result.success) {
        toast.success(dict.news.messages[result.success] || result.success);
      } else if (result.error) {
        toast.error(result.error === 'unauthorized' ? dict.news.messages.unauthorized : dict.news.messages[result.error] || result.error);
      }
    } catch (error) {
      console.error('handleTogglePin error:', error);
      toast.error(dict.news.messages.pinErrorGeneric);
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <Card className='mb-4'>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              {news.isPinned && <Pin className='h-4 w-4 text-primary' />}
              {news.title}
            </CardTitle>
            <CardDescription className='text-sm'>
              {new Date(news.createdAt).toLocaleDateString(lang === 'pl' ? 'pl-PL' : lang === 'de' ? 'de-DE' : 'en-US')} • {extractNameFromEmail(news.author)}
            </CardDescription>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/news/${news._id}/edit`}>
                    <Edit className='mr-2 h-4 w-4' /> {dict.news.actions.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleTogglePin}
                  disabled={isToggling}
                >
                  {news.isPinned ? (
                    <>
                      <PinOff className='mr-2 h-4 w-4' /> {dict.news.actions.unpin}
                    </>
                  ) : (
                    <>
                      <Pin className='mr-2 h-4 w-4' /> {dict.news.actions.pin}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className='text-destructive'
                  disabled={isDeleting}
                >
                  <Trash className='mr-2 h-4 w-4' /> {dict.news.actions.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='prose prose-sm dark:prose-invert max-w-none'>
          <ReactMarkdown>{news.content}</ReactMarkdown>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.news.actions.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dict.news.actions.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dict.news.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? dict.news.actions.deleting : dict.news.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}