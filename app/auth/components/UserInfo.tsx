'use client'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export default function UserInfo() {
  const { data: session } = useSession()
  console.log(session?.user)
  return (
    <>
      <div>Email: {session?.user?.email}</div>
      <div>Name: {session?.user?.name}</div>
      <div>Role: {session?.user?.roles?.join(', ')}</div>
      <button onClick={() => signOut()}>Logout</button>
    </>
  )
}
