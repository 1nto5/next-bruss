import HeaderWrapper from './header-wrapper';
import { getDictionary } from '../lib/dictionary';
import type { Locale } from '@/i18n.config';

interface HeaderProps {
  lang: Locale;
}

export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  return <HeaderWrapper lang={lang} dict={dict} />;
}