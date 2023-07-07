import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'

export default function Footer() {
  return (
    <>
      <div style={{ position: 'fixed', bottom: '10px', left: '10px' }}>
        <Logo />
      </div>
      <div style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
        <ThemeSwitcher />
      </div>
    </>
  )
}
