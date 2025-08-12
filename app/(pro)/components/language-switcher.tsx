'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n.config';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface LanguageSwitcherProps {
  currentLang: Locale;
}

const languageFlags: Record<Locale, string> = {
  pl: '🇵🇱',
  de: '🇩🇪',
  en: '🇬🇧',
  tl: '🇵🇭',
  uk: '🇺🇦',
  be: '🇧🇾',
};

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchLanguage = (newLang: Locale) => {
    if (newLang === currentLang) return;
    
    // Replace the language in the pathname
    const segments = pathname.split('/');
    segments[1] = newLang; // Replace [lang] segment
    const newPathname = segments.join('/');
    
    // Preserve search params
    const search = searchParams.toString();
    const url = search ? `${newPathname}?${search}` : newPathname;
    
    router.push(url);
  };

  const languages: { code: Locale; flag: string }[] = [
    { code: 'pl', flag: '🇵🇱' },
    { code: 'de', flag: '🇩🇪' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'tl', flag: '🇵🇭' },
    { code: 'uk', flag: '🇺🇦' },
    { code: 'be', flag: '🇧🇾' },
  ];

  const currentFlag = languageFlags[currentLang] || '🌐';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-10 w-10'>
          <span className='text-2xl leading-none'>{currentFlag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-0 p-3'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`text-center px-6 py-4 min-h-[56px] flex items-center justify-center ${currentLang === lang.code ? 'bg-accent' : ''}`}
          >
            <span className='text-3xl'>{lang.flag}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}