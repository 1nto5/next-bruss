'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { addComment } from '../actions';
import { Dictionary } from '../lib/dict';

interface Comment {
  content: string;
  createdBy: string;
  createdAt: string | Date;
}

interface CommentsSectionProps {
  requestId: string;
  comments: Comment[];
  dict: Dictionary;
}

export default function CommentsSection({
  requestId,
  comments,
  dict,
}: CommentsSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;

    setIsLoading(true);
    const result = await addComment(requestId, content.trim());
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    setContent('');
    toast.success('Komentarz dodany');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          {dict.comments.title}
        </CardTitle>
        <CardDescription>
          {comments.length === 0
            ? dict.comments.noComments
            : `${comments.length} komentarzy`}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Existing comments */}
        {comments.length > 0 && (
          <div className='space-y-3'>
            {comments.map((comment, index) => (
              <div
                key={index}
                className='rounded-lg border bg-muted/50 p-3'
              >
                <div className='mb-1 flex items-center justify-between'>
                  <span className='font-medium text-sm'>
                    {extractNameFromEmail(comment.createdBy)}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(comment.createdAt).toLocaleString('pl-PL', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className='text-sm whitespace-pre-wrap'>{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment form */}
        <div className='flex gap-2'>
          <Textarea
            placeholder={dict.comments.placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='min-h-[60px]'
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            size='icon'
            className='shrink-0'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
