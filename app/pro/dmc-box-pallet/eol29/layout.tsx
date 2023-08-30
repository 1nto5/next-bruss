import Header from '@/app/pro/dmc-box-pallet/components/Header'

export const metadata = {
  title: 'EOL29 (Next BRUSS)',
  description: 'DMC -> BOX -> PALLET',
}

export default function Eol29Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title={`EOL29`} />
      {children}
    </>
  )
}
