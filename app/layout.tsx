import './globals.css'
import { Inter } from 'next/font/google'
import Logo from './components/Logo'
import Providers from './providers'
import ThemeSwitcher from './components/ThemeSwitcher'
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
      <body className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <Providers>
          <main>{children}</main>
<Footer/>
        </Providers>
      </body>
    </html>
  )
}
