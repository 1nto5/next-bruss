import FullScreenToggle from './FullScreenToggle'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import Reload from './Reload'

export default function Footer() {
  return (
    <>
      <div style={{ position: 'fixed', bottom: '10px', left: '10px' }}>
        <Logo />
      </div>
      <div style={{ position: 'fixed', bottom: '20px', right: '170px' }}>
        <ThemeSwitcher />
      </div>
      <div style={{ position: 'fixed', bottom: '20px', right: '100px' }}>
        <FullScreenToggle />
      </div>
      <div style={{ position: 'fixed', bottom: '20px', right: '30px' }}>
        <Reload />
      </div>
    </>
  )
}
