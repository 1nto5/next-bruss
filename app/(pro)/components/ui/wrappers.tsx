/**
 * Universal wrappers for production floor UI components
 * Provides consistent sizing and formatting across all pro apps
 */

import { Button, ButtonProps } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardProps, CardContentProps, CardHeaderProps } from '@/components/ui/card';
import { Input, InputProps } from '@/components/ui/input';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogProps, DialogContentProps } from '@/components/ui/dialog';
import { Switch, SwitchProps } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import { forwardRef } from 'react';

// Button wrapper with production-friendly sizing
export const PButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'h-14 px-6 text-base',
      sm: 'h-12 px-4 text-sm',
      lg: 'h-16 px-8 text-lg',
      icon: 'h-12 w-12',
    };
    
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'touch-manipulation transition-all',
          size !== 'icon' && sizeClasses[size as keyof typeof sizeClasses],
          size === 'icon' && sizeClasses.icon,
          className
        )}
        {...props}
      />
    );
  }
);
PButton.displayName = 'PButton';

// Input wrapper with production-friendly sizing
export const PInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'h-14 text-base touch-manipulation',
          className
        )}
        {...props}
      />
    );
  }
);
PInput.displayName = 'PInput';

// Card wrapper with production-friendly spacing
export const PCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      />
    );
  }
);
PCard.displayName = 'PCard';

export const PCardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <CardHeader
        ref={ref}
        className={cn('pb-4', className)}
        {...props}
      />
    );
  }
);
PCardHeader.displayName = 'PCardHeader';

export const PCardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <CardContent
        ref={ref}
        className={cn('pt-0', className)}
        {...props}
      />
    );
  }
);
PCardContent.displayName = 'PCardContent';

// Badge wrapper with production-friendly sizing
export const PBadge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn(
          'px-3 py-1.5 text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
PBadge.displayName = 'PBadge';

// Dialog wrapper with production-friendly sizing
export const PDialog = Dialog;

export const PDialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <DialogContent
        ref={ref}
        className={cn('max-w-2xl', className)}
        {...props}
      />
    );
  }
);
PDialogContent.displayName = 'PDialogContent';

// Switch wrapper with production-friendly sizing
export const PSwitch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <Switch
        ref={ref}
        className={cn(
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input scale-125',
          className
        )}
        {...props}
      />
    );
  }
);
PSwitch.displayName = 'PSwitch';

// Select wrappers with production-friendly sizing
export const PSelect = Select;
export const PSelectTrigger = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof SelectTrigger>>(
  ({ className, ...props }, ref) => {
    return (
      <SelectTrigger
        ref={ref}
        className={cn('h-14 text-base', className)}
        {...props}
      />
    );
  }
);
PSelectTrigger.displayName = 'PSelectTrigger';
export const PSelectContent = SelectContent;
export const PSelectItem = SelectItem;
export const PSelectValue = SelectValue;