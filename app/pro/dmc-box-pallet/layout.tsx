import { ReduxProvider } from '@/lib/redux/pro/dmc-box-pallet/provider'

export default function Eol74Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ReduxProvider>{children}</ReduxProvider>
    </>
  )
}
