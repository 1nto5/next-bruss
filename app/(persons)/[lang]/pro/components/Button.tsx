type ButtonProps = {
  text: string
  onClick: () => void
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-48 rounded bg-slate-200 p-3 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      type="button"
    >
      {text}
    </button>
  )
}

export default Button
