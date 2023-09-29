import UserInfo from './auth/components/UserInfo'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/auth/login')

  return (
    <div>
      <UserInfo />
    </div>
  )
}
