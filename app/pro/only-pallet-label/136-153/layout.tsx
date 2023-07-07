import Header from '../../components/Header'

export const metadata = {
  title: '136/153 Only Pallet Label (Next BRUSS)',
  // description: 'Company helper applications',
}

export default function OnlyPalletLabelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title="136/153 Only Pallet Label" />
      {children}
    </>
  )
}
