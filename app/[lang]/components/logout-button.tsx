'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOutAction } from '@/app/[lang]/auth/actions';

export function LogoutButton({ lang }: { lang: string }) {
  return (
    <form action={signOutAction}>
      <input type="hidden" name="lang" value={lang} />
      <Button variant="ghost" size="icon" type="submit">
        <LogOut />
      </Button>
    </form>
  );
}
