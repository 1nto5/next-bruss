import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import CardChooser from './components/CardChooser'

export default async function Register() {
  const session = await getServerSession(authOptions)
  if (!session || !session?.user?.roles?.includes('inventory'))
    redirect('/auth/login')

  return <CardChooser />
}
