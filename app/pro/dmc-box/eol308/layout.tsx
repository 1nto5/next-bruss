import Header from '@/app/pro/dmc-box-pallet/components/Header'

export const metadata = {
  title: 'EOL308 (Next BRUSS)',
  description: 'DMC -> BOX',
}

export default function Eol74Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title={`EOL308`} />
      {children}
    </>
  )
}
