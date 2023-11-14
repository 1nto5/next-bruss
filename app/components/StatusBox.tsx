import clsx from 'clsx';

type StatusBoxProps = {
  name: string | number | undefined;
  value: string | number | undefined;
  width: string;
  loading?: boolean;
  full?: boolean;
  separator?: boolean;
};

export default function StatusBox({
  name,
  value,
  width,
  loading = false,
  full = false,
  separator = true,
}: StatusBoxProps) {
  return (
    <>
      <div className={`${width} box-border text-center`}>
        <p className='text-lg font-thin  tracking-widest text-slate-900 dark:text-slate-100 md:text-xl'>
          {name}
        </p>
        <p
          className={clsx('text-xl md:text-3xl', {
            'animate-pulse text-slate-300 dark:text-slate-500':
              loading === true,
            'text-slate-900 dark:text-slate-50': full === false,
            'animate-bounce text-bruss dark:text-bruss': full === true,
          })}
        >
          {value ?? '-'}
        </p>
      </div>
      {separator && (
        <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      )}
    </>
  );
}
