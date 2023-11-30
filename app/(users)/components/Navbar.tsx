'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      id: 1,
      text: 'Główna',
      link: '/',
    },
    {
      id: 2,
      text: 'Inventory Approve',
      link: '/inventory-approve',
    },
    {
      id: 3,
      text: 'Export Data',
      link: '/export-data',
    },
    {
      id: 4,
      text: 'Experience',
      link: 'experience',
    },
    {
      id: 5,
      text: 'Contact',
      link: 'contact',
    },
  ];

  return (
    <div className='nav fixed top-0 z-10 flex h-16 w-full items-center justify-between bg-slate-100 px-4 shadow-md dark:bg-slate-800'>
      <div className='ml-2'>
        <h1 className='text-lg font-thin text-slate-900 dark:text-slate-100'>
          <Link href='/'>
            <Image src='/logo.png' alt='Logo' width={100} height={50} />
          </Link>
        </h1>
      </div>

      <ul className='hidden md:flex'>
        {links.map(({ id, text, link }) => {
          const isActive = pathname === link;
          const linkClasses = clsx(
            'px-4 font-medium capitalize transition-colors duration-300',
            {
              'text-slate-900 hover:text-slate-600': !isActive,
              'text-bruss dark:text-slate-300': isActive,
            },
          );
          return (
            <li key={id} className={linkClasses}>
              <Link href={link}>{text}</Link>
            </li>
          );
        })}
      </ul>

      <div
        onClick={() => setNav(!nav)}
        className='cursor-pointer pr-4 text-slate-900 dark:text-slate-100 md:hidden'
      >
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

      {nav && (
        <ul className='absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 dark:from-slate-800 dark:to-slate-700 dark:text-slate-100'>
          {links.map(({ id, text, link }) => (
            <li key={id} className='px-4 py-6 text-4xl capitalize'>
              <Link onClick={() => setNav(!nav)} href={link}>
                {text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Navbar;
