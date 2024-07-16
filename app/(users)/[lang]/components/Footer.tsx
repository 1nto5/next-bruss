import Container from '@/components/ui/container';

export default function Footer() {
  return (
    <footer className='border-t py-1'>
      <Container>
        <div className='flex h-4 w-full items-center justify-center'>
          <p className='text-xs font-extralight opacity-10'>Adrian A. 2024</p>
        </div>
      </Container>
    </footer>
  );
}
