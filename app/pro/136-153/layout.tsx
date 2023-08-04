import Header from './components/Header'
import { ReduxProvider } from '@/lib/redux/pro/136-153/provider'

export const metadata = {
  title: '136/153 (Next BRUSS)',
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
      <ReduxProvider>
        <Header title={`136/153`} />
        {children}
      </ReduxProvider>
    </>
  )
}
