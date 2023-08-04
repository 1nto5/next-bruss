// import { ReduxProvider } from '@/lib/redux/pro/provider'

import Toast from './components/Toast'

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
      {/* <ReduxProvider>{children}</ReduxProvider> */}
      {children}
      <Toast />
    </>
  )
}
