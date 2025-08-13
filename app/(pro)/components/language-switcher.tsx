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

export default function LanguageSwitcher({
  currentLang,
}: LanguageSwitcherProps) {
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

  const languages: { code: Locale; flag: string; name: string }[] = [
    { code: 'pl', flag: '🇵🇱', name: 'Polski' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'tl', flag: '🇵🇭', name: 'Tagalog' },
    { code: 'uk', flag: '🇺🇦', name: 'Українська' },
    { code: 'be', flag: '🇧🇾', name: 'Беларуская' },
  ];

  const currentFlag = languageFlags[currentLang] || '🌐';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-10 w-10'>
          <span className='text-xl'>{currentFlag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={currentLang === lang.code ? 'bg-accent' : ''}
          >
            <div className='flex items-center gap-3'>
              <span className='text-xl'>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
