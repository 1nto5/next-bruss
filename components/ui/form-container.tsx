interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return <div className='flex justify-center'>{children}</div>;
};

export default FormContainer;
