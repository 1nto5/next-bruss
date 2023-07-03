import Navbar from './components/Navbar'

export const metadata = {
  title: 'Next BRUSS: Only Pallet Label',
  // description: 'Company helper applications',
}

export default function OnlyPalletLabelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
