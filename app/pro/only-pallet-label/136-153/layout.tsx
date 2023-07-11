import Header from '../../components/Header'
// import { headers } from 'next/headers'

export const metadata = {
  title: '136/153 Only Pallet Label (Next BRUSS)',
  // description: 'Company helper applications',
}

export default function OnlyPalletLabelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  //  const workplace =  headers().get('referer')?.split('/').pop()

  return (
    <>
      <Header title={`136/153 Only Pallet Label`} />
      {children}
    </>
  )
}
