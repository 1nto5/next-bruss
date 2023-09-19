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
      <h1 className="text-lg font-thin text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <div className="flex space-x-6">
        {pathname.includes('position-') && (
          <button
            onClick={() => router.back()}
            className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-red-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-red-700"
            type="button"
          >
            change position
          </button>
        )}
        {pathname.includes('card-') && (
          <button
            onClick={() => router.push('/inventory')}
            className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-red-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-red-700"
            type="button"
          >
            change card
          </button>
        )}
        {session && (
          <button
            onClick={() => signOut()}
            className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-red-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-red-700"
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
