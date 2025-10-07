'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bold, Italic, Heading2, Link as LinkIcon, List, ListOrdered, Code } from 'lucide-react';
import { RefObject } from 'react';

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function MarkdownToolbar({ textareaRef }: MarkdownToolbarProps) {
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const insertText = selectedText || placeholder;
    const newText = text.substring(0, start) + before + insertText + after + text.substring(end);

    textarea.value = newText;

    // Trigger onChange event for React Hook Form
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);

    // Set cursor position
    const newCursorPos = selectedText
      ? start + before.length + insertText.length + after.length
      : start + before.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
  };

  const buttons = [
    {
      icon: Bold,
      label: 'Bold',
      tooltip: 'Bold (Ctrl+B)',
      action: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      tooltip: 'Italic (Ctrl+I)',
      action: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: Heading2,
      label: 'Heading',
      tooltip: 'Heading',
      action: () => insertMarkdown('## ', '', 'Heading'),
    },
    {
      icon: LinkIcon,
      label: 'Link',
      tooltip: 'Insert Link',
      action: () => insertMarkdown('[', '](url)', 'link text'),
    },
    {
      icon: List,
      label: 'Bullet List',
      tooltip: 'Bullet List',
      action: () => insertMarkdown('- ', '', 'list item'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      tooltip: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'list item'),
    },
    {
      icon: Code,
      label: 'Code',
      tooltip: 'Inline Code',
      action: () => insertMarkdown('`', '`', 'code'),
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className='flex items-center gap-1 rounded-md border bg-muted/30 p-1'>
        {buttons.map((button, index) => (
          <div key={button.label} className='flex items-center'>
            {index === 3 && <Separator orientation='vertical' className='mx-1 h-6' />}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={button.action}
                >
                  <button.icon className='h-4 w-4' />
                  <span className='sr-only'>{button.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{button.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
