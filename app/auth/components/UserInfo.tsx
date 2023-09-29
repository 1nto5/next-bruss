'use client'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export default function UserInfo() {
  const { data: session } = useSession()
  console.log(session?.user)
  if (session?.user.roles?.includes('admin')) {
    return (
      <>
        <p>You are an admin, welcome!</p>
        <button onClick={() => signOut()}>Logout</button>
      </>
    )
  }
  return (
    <>
      <div>Email: {session?.user?.email}</div>
      <div>Name: {session?.user?.name}</div>
      <div>Role: {session?.user?.roles?.join(', ')}</div>
      <button onClick={() => signOut()}>Logout</button>
    </>
  )
}
