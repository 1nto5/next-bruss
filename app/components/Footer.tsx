import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'

export default function Footer() {
  return (
    <div className="fixed bottom-0 flex w-full items-end justify-between p-4">
      <Logo />
      <ThemeSwitcher />
    </div>
  )
}
