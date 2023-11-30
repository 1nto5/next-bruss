import UserInfo from './components/UserInfo';
import { getServerSession } from 'next-auth';
// import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // if (!session) redirect('/auth/login');

  return <>{/* <UserInfo /> */}</>;
}
