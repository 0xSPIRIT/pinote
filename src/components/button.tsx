type ButtonProps = {
  name: string;
  onClick: () => void;
};

export default function Button(props: ButtonProps) {
  return <button className="cursor-pointer rounded-xl bg-gray-900 outline-2 outline-gray-700 text-gray-200 text-base py-2 px-4" onClick={props.onClick}>{props.name}</button>
}
