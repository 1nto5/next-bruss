'use client'

import Button from '@/app/pro/components/Button'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

type HeaderProps = {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const session = useSession()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 p-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <h1 className="ml-2 mr-4 text-lg font-thin text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <div className="mr-2 flex space-x-4">
        {pathname.includes('position-') && (
          <button
            onClick={() => router.push(pathname.replace(/\/position-.*/, ''))}
            className="w-20 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            type="button"
          >
            position
          </button>
        )}
        {pathname.includes('card-') && (
          <button
            onClick={() => router.push('/inventory')}
            className="w-20 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            type="button"
          >
            card
          </button>
        )}
        {session && (
          <button
            onClick={() => signOut()}
            className="w-20 rounded bg-red-600 p-2 text-center text-lg font-extralight text-slate-100 shadow-sm hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700"
            type="button"
          >
            logout
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
