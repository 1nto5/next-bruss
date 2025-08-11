'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { ProButton } from '@/app/(pro)/components/ui/pro-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ProButton variant='ghost' size='icon' className='h-12 w-12'>
          <Sun className='h-6 w-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute h-6 w-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
        </ProButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={5}
        className='w-auto min-w-[100px] p-3'
      >
        <DropdownMenuItem onClick={() => setTheme('light')} className='px-6 py-4 min-h-[56px] flex items-center justify-center'>
          <Sun className='h-8 w-8' />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className='px-6 py-4 min-h-[56px] flex items-center justify-center'>
          <Moon className='h-8 w-8' />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}