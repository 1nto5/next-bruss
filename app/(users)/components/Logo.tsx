import Image from 'next/image';

type LogoProps = {
  logoStyles?: string; // Dodawanie opcjonalnego propa className
};

export default function Logo({ logoStyles }: LogoProps) {
  return (
    <Image
      className={logoStyles ?? ''}
      src='/logo.png'
      width={80}
      height={100}
      alt='BRUSS'
      priority={false}
    />
  );
}
