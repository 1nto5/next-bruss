'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';

interface ScanInputProps {
  name: string;
  placeholder: string;
  savingPlaceholder: string;
}

export function ScanInput({ name, placeholder, savingPlaceholder }: ScanInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Input
      ref={inputRef}
      type='text'
      id={name}
      name={name}
      placeholder={isPending ? savingPlaceholder : placeholder}
      disabled={isPending}
      autoComplete='off'
      className='text-center'
      onFocus={(e) => e.target.select()}
      onChange={() => {
        if (isPending !== false) {
          setIsPending(false);
        }
      }}
      onBlur={(e) => {
        if (e.target.value && !isPending) {
          setIsPending(true);
          e.target.form?.requestSubmit();
        }
      }}
    />
  );
}