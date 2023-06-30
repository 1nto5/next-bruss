import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      className=""
      src="/logo.png"
      width={100}
      height={100}
      alt="BRUSS"
      priority={true}
    />
  )
}
