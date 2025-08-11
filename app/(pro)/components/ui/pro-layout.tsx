'use client';

import { ProBadge } from './pro-badge';
import { ProButton } from './pro-button';
import type { ReactNode } from 'react';

interface ProHeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export function ProHeader({ 
  leftContent, 
  rightContent
}: ProHeaderProps) {
  return (
    <header className='bg-background sticky top-0 z-50 w-full border-b px-4 py-6 transition-all'>
      <div className='relative mx-auto flex w-full items-center justify-between'>
        <div className='flex items-center gap-4'>
          {leftContent}
        </div>
        <div className='flex items-center gap-6'>
          {rightContent}
        </div>
      </div>
    </header>
  );
}

interface ProHeaderBadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export function ProHeaderBadge({ icon, children, variant = 'default', className = '' }: ProHeaderBadgeProps) {
  return (
    <ProBadge variant={variant} className={`flex items-center gap-2 ${className}`} proSize='default'>
      {icon && <span className='h-5 w-5'>{icon}</span>}
      {children}
    </ProBadge>
  );
}

interface ProHeaderButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
}

export function ProHeaderButton({ icon, onClick, title, variant = 'ghost' }: ProHeaderButtonProps) {
  return (
    <ProButton
      onClick={onClick}
      variant={variant}
      size='icon'
      className='h-12 w-12'
      title={title}
    >
      <span className='h-6 w-6'>{icon}</span>
    </ProButton>
  );
}