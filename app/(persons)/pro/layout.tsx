import Toast from './components/Toast';

export const metadata = {
  title: 'Next BRUSS: Produktion',
  // description: 'Company helper applications',
};

export default function OnlyPalletLabelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
