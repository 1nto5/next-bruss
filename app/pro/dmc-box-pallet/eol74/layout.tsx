import Header from '@/app/pro/dmc-box-pallet/components/Header'

export const metadata = {
  title: 'EOL74 (Next BRUSS)',
  // description: 'Company helper applications',
}

export default function Eol74Layout({
  children,
}: {
  children: React.ReactNode
}) {
  //  const workplace =  headers().get('referer')?.split('/').pop()

  return (
    <>
      <Header title={`EOL74`} />
      {children}
    </>
  )
}
