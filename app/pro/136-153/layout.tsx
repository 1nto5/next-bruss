import Header from './components/Header'
import { ReduxProvider } from '@/lib/redux/pro/136-153/provider'

export const metadata = {
  title: 'M136 / M153 (Next BRUSS)',
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
        <Header title={`M136 / M153`} />
        {children}
      </ReduxProvider>
    </>
  )
}
