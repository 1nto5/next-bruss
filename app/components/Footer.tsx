import Logo from "./Logo"
import ThemeSwitcher from "./ThemeSwitcher"

export default function Footer() {
  return (
    <div className="fixed bottom-0 flex justify-between items-end p-8 w-full">
      <Logo />
      <ThemeSwitcher />
    </div>
  );
}