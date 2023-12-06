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
      <div className={`${width} box-border pl-1 pr-1 text-center`}>
        <p className='text-xs font-thin tracking-widest text-slate-900 dark:text-slate-100 sm:text-lg md:text-xl lg:text-xl'>
          {name}
        </p>
        <p
          className={clsx('text-xs sm:text-xl md:text-2xl lg:text-2xl', {
            'animate-pulse text-slate-200 dark:text-slate-600':
              loading === true,
            'text-slate-900 dark:text-slate-50': full === false,
            'animate-bounce text-bruss dark:text-bruss': full === true,
          })}
        >
          {value ?? '-'}
        </p>
      </div>
      {separator && (
        <div className='h-8 border-l-2 border-slate-200 dark:border-slate-700 sm:h-12 md:h-16 lg:h-20'></div>
      )}
    </>
  );
}
