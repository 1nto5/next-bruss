import Header from '@/app/pro/dmc-box-pallet/components/Header'

export const metadata = {
  title: 'EOL80 (Next BRUSS)',
  description: 'DMC -> BOX -> PALLET',
}

export default function Eol80Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title={`EOL80`} />
      {children}
    </>
  )
}
