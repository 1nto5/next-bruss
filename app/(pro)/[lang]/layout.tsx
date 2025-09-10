import '@/app/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // title: 'DMCheck (BRUSS)',
  // description: 'Company helper applications',
};

export default async function ProLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return <>{children}</>;
}
