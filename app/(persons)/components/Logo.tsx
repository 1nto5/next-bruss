import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      className='ml-2'
      src='/logo.png'
      sizes='16vw'
      style={{
        width: '100%',
        height: 'auto',
      }}
      width={150}
      height={100}
      alt='BRUSS'
      priority={true}
    />
  );
}
