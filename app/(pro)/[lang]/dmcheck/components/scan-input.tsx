import { Input } from '@/components/ui/input';
import { useFormStatus } from 'react-dom';
import { Skeleton } from '@/components/ui/skeleton';

type ScanInputProps = {
  name: string;
  savingPlaceholder: string;
  placeholder: string;
};

export function ScanInput({
  name,
  savingPlaceholder,
  placeholder,
}: ScanInputProps) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Skeleton>
          <Input
            disabled
            placeholder={savingPlaceholder}
            className='text-center'
          />
        </Skeleton>
      ) : (
        <>
          <Input
            id={name}
            name={name}
            autoFocus
            type='text'
            placeholder={placeholder}
            className='text-center'
            autoComplete='off'
          />
          <input type='submit' hidden />
        </>
      )}
    </>
  );
}
