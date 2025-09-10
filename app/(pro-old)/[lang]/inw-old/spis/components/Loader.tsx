'use client';

export default function Loader() {
  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        pobieranie danych
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <div className='mb-16 mt-16 flex justify-center'>
          <div className='h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss'></div>
        </div>
      </div>
    </>
  );
}
