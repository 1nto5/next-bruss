import * as React from 'react';

interface DialogFormWithScrollProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFormWithScroll = ({
  children,
  className,
}: DialogFormWithScrollProps) => {
  return (
    <div className={`mr-4 ml-1 grid items-center gap-2 ${className || ''}`}>
      {children}
    </div>
  );
};

export default DialogFormWithScroll;
