export default function Button({name, onClick, className}) {
  const styling = "cursor-pointer rounded-xl bg-gray-900 outline-2 outline-gray-700 text-gray-200 text-base py-0.5 px-2 " + className;

  return <button className={styling} onClick={onClick}>{name}</button>
}
