interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className='mx-auto w-full max-w-(--breakpoint-2xl)'>{children}</div>;
};

export default Container;
