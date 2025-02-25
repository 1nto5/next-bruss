'use client';
import Container from '@/components/ui/container';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <footer
      className={`w-full border-t px-6 py-2 ${isScrolled && 'border-t-0'}`}
    >
      <Container>
        <div className='text-right text-sm text-muted-foreground'>
          Adrian Antosiak 2025
        </div>
      </Container>
    </footer>
  );
}
