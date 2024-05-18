import { splitProps, type Component, type JSX } from "solid-js";

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export const Input: Component<InputProps> = (props) => {
  const [, rest] = splitProps(props, ["children"]);
  return (
    <input
      {...rest}
      class={`
        flex flex-row items-center gap-2
        p-2 m-2
        font-shortstack text-sm
        bg-stone-100 dark:bg-stone-900 autofill:bg-transparent
        rounded-drawn
        outline-none
        focus-visible:outline-offset-4
        focus-visible:outline-stone-800 dark:focus-visible:outline-stone-100
        text-stone-800 dark:text-stone-100 
      `}
    />
  );
};
