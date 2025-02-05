import '@/app/globals.css';
import Container from '@/components/ui/container';
import Footer from '@/components/ui/footer';
import FormContainer from '@/components/ui/form-container';
import { Metadata } from 'next';
import Header from './components/header';
import QueryProvider from './lib/query-provider';

export const metadata: Metadata = {
  title: 'BRI oven (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function BriOvenLayout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  return (
    <QueryProvider>
      <Container>
        <div className='flex min-h-screen flex-col'>
          <Header />
          <main className='flex-1'>
            <FormContainer>{children}</FormContainer>
          </main>
          <Footer />
        </div>
      </Container>
    </QueryProvider>
  );
}
