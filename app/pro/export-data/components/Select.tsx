//TODO: format Select with tailwind: https://www.jussivirtanen.fi/writing/styling-react-select-with-tailwind

import { useEffect, useState } from 'react';
import ReactSelect from 'react-select';

type Option = {
  value: number | string;
  label: string;
};

type SelectProps = {
  options: Option[] | string[];
  value: any;
  onChange: any;
  placeholder: string;
  isDisabled?: boolean;
};

const selectDarkTheme = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? '#4A5568'
      : state.isSelected
      ? '#2D3748'
      : '#1A202C',
    color: '#F7FAFC', // slate-100 z Tailwind
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#1A202C',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: '#1A202C',
    borderColor: '#4A5568',
    color: '#F7FAFC',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#F7FAFC',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#F7FAFC',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#A0AEC0', // slate-500 w ciemnym trybie powinien być dobrze widoczny
  }),
};

const selectLightTheme = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? '#E2E8F0'
      : state.isSelected
      ? '#EDF2F7'
      : 'white',
    color: '#2D3748',
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: '#CBD5E0',
    color: '#2D3748',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#2D3748',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#2D3748',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#A0AEC0',
  }),
};

export default function Select({
  options,
  value,
  onChange,
  placeholder,
  isDisabled,
}: SelectProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    checkDarkMode();
    return () => observer.disconnect();
  }, []);

  return (
    <div className='flex items-center justify-center'>
      <ReactSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full max-w-xs text-center'
        menuPlacement='auto'
        styles={isDarkMode ? selectDarkTheme : selectLightTheme}
        isDisabled={isDisabled}
        isClearable={true}
      />
    </div>
  );
}
