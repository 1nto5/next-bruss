'use client';

import { FaRedo } from 'react-icons/fa';

const Reload = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleReload}
      className='mb-1 text-xl sm:text-xl md:text-2xl lg:text-3xl'
    >
      <FaRedo />
    </button>
  );
};

export default Reload;
