import './globals.css'
import { Inter } from 'next/font/google'
import DarkLightProvider from './theme-provider'

import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body className="bg-slate-50 dark:bg-slate-950">
        <DarkLightProvider>
          <main>{children}</main>
          <Footer />
        </DarkLightProvider>
      </body>
    </html>
  )
}
