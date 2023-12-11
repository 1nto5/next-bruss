import LoginForm from '../components/LoginForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth/authOptions';

export default async function Login() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/');
  return <LoginForm />;
}
