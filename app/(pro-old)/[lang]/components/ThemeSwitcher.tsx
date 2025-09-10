'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <div className='mr-2'>
      <button
        onClick={toggleTheme}
        className='text-lg sm:text-xl md:text-2xl lg:text-3xl'
      >
        {theme === 'light' ? (
          <FaMoon className='text-gray-700' />
        ) : (
          <FaSun className='text-yellow-400' />
        )}
      </button>
    </div>
  );
};

export default ThemeSwitcher;
