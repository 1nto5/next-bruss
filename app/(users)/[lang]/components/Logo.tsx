import Image from 'next/image';
import logo from '@/public/logo.png';

type LogoProps = {
  logoStyles?: string;
};

export default function Logo({ logoStyles }: LogoProps) {
  return (
    // <Image
    //   className={logoStyles ?? ''}
    //   src='/logo.png'
    //   width={80}
    //   height={100}
    //   alt='BRUSS'
    //   // priority={false}
    // />
    <Image
      src={logo}
      // You don't need to specify
      //either height nor width but
      // you should if you wan't to
      // change the size
      // height={100}
      width={100}
      // Optional blur-up
      // while loading
      // placeholder='blur'
      alt='BRUSS'
    />
  );
}
