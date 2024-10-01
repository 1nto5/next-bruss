import FormContainer from '@/components/ui/form-container';

export const metadata = {
  title: 'export data (Next BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FormContainer>{children}</FormContainer>;
}
