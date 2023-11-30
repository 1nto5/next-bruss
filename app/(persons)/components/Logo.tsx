import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      className='ml-2'
      src='/logo.png'
      width={150}
      height={100}
      alt='BRUSS'
      priority={true}
    />
  );
}
