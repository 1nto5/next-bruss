import Footer from '@/components/footer';
import type { ReactNode } from 'react';

interface ProLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  paddingX?: 'px-1' | 'px-2' | 'px-4';
  paddingY?: 'py-1' | 'py-2' | 'py-4' | '';
  spacing?: boolean;
  showFooter?: boolean;
  contentClassName?: string;
}

/**
 * Universal layout wrapper for production floor applications
 * Provides consistent layout structure with configurable spacing
 * Default padding: px-2 py-2 (from dmcheck-2)
 */
export default function ProLayout({
  children,
  header,
  paddingX = 'px-2',
  paddingY = 'py-2',
  spacing = false,
  showFooter = true,
  contentClassName = 'w-full',
}: ProLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${spacing ? 'space-y-1' : ''}`}>
      {header}
      <main className={`w-full flex-1 ${paddingX} ${paddingY}`}>
        <div className={contentClassName}>{children}</div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}