import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position='bottom-center'
      reverseOrder={false}
      gutter={8}
      containerClassName=''
      containerStyle={{
        bottom: '15%',
      }}
      toastOptions={{
        className: '',
        duration: 2500,
        style: {
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: '600',
          background: 'rgb(243 244 246)',
          color: '#333',
          padding: '30px',
        },

        success: {
          duration: 2000,
          style: {
            background: 'rgb(139 182 59)',
            color: 'white',
            fontWeight: '600',
          },
        },

        error: {
          duration: 3000,
          style: {
            background: 'rgb(239 68 68)',
            color: 'rgb(249 250 251)',
            fontWeight: '600',
          },
        },
      }}
    />
  );
};

export default Toast;
