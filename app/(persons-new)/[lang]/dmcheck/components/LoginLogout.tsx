import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

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
      {isLoggedIn ? (
        <LogOut className='h-[1.2rem] w-[1.2rem]' />
      ) : (
        <LogIn className='h-[1.2rem] w-[1.2rem]' />
      )}
    </Button>
  );
};
