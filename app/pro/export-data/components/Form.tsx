'use client';

import { SetStateAction, useState } from 'react';
import Select from './Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import config from '@/app/pro/config';
import clsx from 'clsx';

export default function Form() {
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [timeFrom, setTimeFrom] = useState<Date | null>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [timeTo, setTimeTo] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const workplaces = Array.from(new Set(config.map((item) => item.workplace)));
  const filteredArticles = config.filter(
    (item) => item.workplace === selectedWorkplace,
  );
  const statusOptions = [
    { label: 'podczas pakowania', value: 'box' },
    { label: 'na palecie', value: 'pallet' },
    { label: 'na magazynie', value: 'warehouse' },
  ];

  const generateExcel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = {
      workplace: selectedWorkplace,
      article: selectedArticle,
      status: selectedStatus,
      //   timeFrom: timeFrom,
      //   timeTo: timeTo,
      searchTerm: searchTerm,
    };

    try {
      const response = await fetch('/api/generate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Create a Blob from the response
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${selectedWorkplace}.xlsx`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error('There was an error generating the Excel file:', error);
    }
  };

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        wybór kryteriów exportu
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <form className='flex w-11/12 flex-col gap-3' onSubmit={generateExcel}>
          <Select
            options={workplaces.map((workplace) => ({
              label: workplace.toUpperCase(),
              value: workplace,
            }))}
            onChange={(option: { value: SetStateAction<null> }) =>
              setSelectedWorkplace(option.value)
            }
            placeholder='wybierz stanowisko'
          />
          {selectedWorkplace && (
            <Select
              options={filteredArticles.map((article) => ({
                label: `${article.name} (${article.article})`,
                value: article.article,
              }))}
              onChange={(option: { value: SetStateAction<null> }) =>
                setSelectedArticle(option.value)
              }
              placeholder='wybierz artykuł'
              isDisabled={!selectedWorkplace}
            />
          )}
          {selectedArticle && selectedWorkplace && (
            <Select
              options={statusOptions}
              onChange={(option: { value: SetStateAction<null> }) =>
                setSelectedStatus(option.value)
              }
              placeholder='wybierz status'
              isDisabled={!selectedWorkplace}
            />
          )}
          <div className='flex justify-center space-x-2'>
            <div className='flex flex-col items-center'>
              <label className='mb-1 text-sm text-slate-700'>data od:</label>
              <DatePicker
                selected={timeFrom}
                onChange={(date) => setTimeFrom(date)}
                className='rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900 dark:outline-slate-600'
                showTimeSelect
                timeIntervals={15}
                dateFormat='P HH:mm'
                timeFormat='HH:mm'
              />
            </div>
            <div className='flex flex-col items-center'>
              <label className='mb-1 text-sm text-slate-700'>data do:</label>
              <DatePicker
                selected={timeTo}
                onChange={(date) => setTimeTo(date)}
                className='rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900 dark:outline-slate-600'
                showTimeSelect
                timeIntervals={15}
                dateFormat='P HH:mm'
                timeFormat='HH:mm'
              />
            </div>
          </div>
          <input
            type='text'
            className='items-center rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900 dark:outline-slate-600'
            placeholder='wyszukaj DMC / hydra batch / pallet batch'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type='submit'
            className={clsx(
              `w-full rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100`,
              { 'animate-pulse': false },
            )}
            disabled={!selectedWorkplace}
          >
            generuj excel
          </button>
        </form>
      </div>
    </div>
  );
}
