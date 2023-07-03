export default function WorkplaceCard({
  workplaceName,
}: {
  workplaceName: string
}) {
  return (
    <button
      //   onClick={handleClickWorkplace}
      className="mb-16 ml-8 mr-8 rounded bg-gray-100 p-10 text-center text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
    >
      <span className="block text-4xl tracking-widest">{workplaceName}</span>
    </button>
  )
}
