'use client'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export default function UserInfo() {
  const { data: session } = useSession()
  return (
    <>
      <div className="text-center">
        <p className="mt-10">
          One day there will be something beautiful here, for now you can log
          out:
        </p>
        <button onClick={() => signOut()}>Logout</button>
        <p className="mt-10">Name: {session?.user?.name}</p>
        <p className="mt-2">Roles: {session?.user?.roles?.join(', ')}</p>
      </div>
    </>
  )
}
