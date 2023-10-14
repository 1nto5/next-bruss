import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import Reload from './Reload'

export default function Footer() {
  return (
    <footer className="mb-2 ml-4 mr-8 mt-24 flex items-center justify-between lg:fixed lg:inset-x-0 lg:bottom-0 ">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
        <Reload />
      </div>
    </footer>
  )
}
