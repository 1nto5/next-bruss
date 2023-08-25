import Header from '@/app/pro/dmc-box-pallet/components/Header'

export const metadata = {
  title: 'EOL74 (Next BRUSS)',
  description: 'DMC -> BOX -> PALLET',
}

export default function Eol74Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title={`EOL74`} />
      {children}
    </>
  )
}
