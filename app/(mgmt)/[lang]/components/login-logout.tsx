import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import * as React from 'react';

interface LoginLogoutButtonProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  buttonStyle?: string;
}

export const LoginLogout: React.FC<LoginLogoutButtonProps> = ({
  isLoggedIn,
  onLogin,
  onLogout,
  buttonStyle,
}) => {
  return (
    <Button
      className={buttonStyle}
      onClick={isLoggedIn ? onLogout : onLogin}
      variant='outline'
      size='icon'
    >
      {isLoggedIn ? <LogOut /> : <LogIn />}
    </Button>
  );
};
