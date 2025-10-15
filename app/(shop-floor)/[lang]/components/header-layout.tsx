'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export function Header({ leftContent, rightContent }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between border-b bg-background px-2 py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {leftContent}
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </header>
  );
}

interface HeaderBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export function HeaderBadge({ children, icon, variant = 'default', className }: HeaderBadgeProps) {
  return (
    <Badge variant={variant} className={cn('flex items-center gap-2 px-3 py-1.5 text-sm', className)}>
      {icon}
      {children}
    </Badge>
  );
}

interface HeaderButtonProps {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  text?: string;
  variant?: 'ghost' | 'destructive';
}

export function HeaderButton({ icon, onClick, title, text, variant = 'ghost' }: HeaderButtonProps) {
  if (text) {
    return (
      <Button
        variant={variant}
        onClick={onClick}
        title={title}
        className="h-10 w-10 lg:w-auto lg:px-3 flex items-center justify-center lg:gap-2"
      >
        {icon}
        <span className="text-sm hidden lg:inline">{text}</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      title={title}
      className="h-10 w-10"
    >
      {icon}
    </Button>
  );
}