import { splitProps, type Component, type JSX } from "solid-js";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: Component<ButtonProps> = (props) => {
	const [, rest] = splitProps(props, ["children"]);
	return (
		<button
			{...rest}
			class={`
        flex flex-row items-center gap-2
        font-shortstack text-sm
        border border-stone-500 dark:border-stone-500 p-2
        outline-none
        focus-visible:outline-offset-4
        focus-visible:outline-stone-800 dark:focus-visible:outline-stone-100
        text-stone-800 dark:text-stone-100 rounded-drawn
        hover:rotate-2
      `}
		>
			{props.children}
		</button>
	);
};
