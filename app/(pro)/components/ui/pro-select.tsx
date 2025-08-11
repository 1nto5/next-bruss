'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProSelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectTrigger> {
  proSize?: 'sm' | 'default' | 'lg' | 'xl';
}

const ProSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  ProSelectTriggerProps
>(({ className, proSize = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-12 px-4 py-2.5 text-sm [&_svg]:h-5 [&_svg]:w-5',
    default: 'h-14 px-5 py-3 text-base [&_svg]:h-6 [&_svg]:w-6',
    lg: 'h-16 px-6 py-4 text-lg [&_svg]:h-7 [&_svg]:w-7',
    xl: 'h-20 px-8 py-5 text-xl [&_svg]:h-8 [&_svg]:w-8',
  };

  return (
    <SelectTrigger
      ref={ref}
      className={cn(
        'touch-manipulation transition-all duration-200',
        'focus:ring-4 focus:ring-offset-4',
        'border-2 rounded-lg',
        sizeClasses[proSize],
        className,
      )}
      {...props}
    />
  );
});
ProSelectTrigger.displayName = 'ProSelectTrigger';

const ProSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, ...props }, ref) => (
  <SelectContent
    ref={ref}
    className={cn(
      'max-h-[400px] min-w-[12rem] border-2 rounded-lg',
      '[&_[role=option]]:min-h-[56px] [&_[role=option]]:px-4 [&_[role=option]]:py-3',
      '[&_[role=option]]:text-base [&_[role=option]]:touch-manipulation',
      '[&_[role=option]]:transition-colors',
      className,
    )}
    {...props}
  />
));
ProSelectContent.displayName = 'ProSelectContent';

const ProSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      'min-h-[56px] px-4 py-3 text-base touch-manipulation',
      'transition-colors duration-150',
      className,
    )}
    {...props}
  />
));
ProSelectItem.displayName = 'ProSelectItem';

export {
  Select as ProSelect,
  ProSelectContent,
  SelectGroup as ProSelectGroup,
  ProSelectItem,
  SelectLabel as ProSelectLabel,
  SelectScrollDownButton as ProSelectScrollDownButton,
  SelectScrollUpButton as ProSelectScrollUpButton,
  SelectSeparator as ProSelectSeparator,
  ProSelectTrigger,
  SelectValue as ProSelectValue,
};