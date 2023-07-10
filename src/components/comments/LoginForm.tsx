import type { BskyAgent } from "@atproto/api";
import type { Accessor, Component } from "solid-js";

interface LoginFormProps {
  agent: Accessor<BskyAgent | undefined>;
}

export const LoginForm: Component<LoginFormProps> = ({ agent }) => {
  return (
    <div class="flex flex-col items-center justify-center">
      <p class="font-bold pb-4">
        Login to comment, or go to <a href="">bsky.app</a>.
      </p>
      <form
        class="flex flex-col items-center justify-center w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          console.log("Logging in");
          const formData = new FormData(e.currentTarget);
          const handle = formData.get("handle");
          const password = formData.get("password");
          if (handle && password) {
            const res = await agent()?.login({
              identifier: handle.toString(),
              password: password.toString(),
            });
          }
        }}
      >
        {/* Insert nice looking input */}

        <label class="flex flex-col">
          Handle
          <input
            class={`
            
            w-64 p-2 mt-1 mb-4 bg-stone-800
            rounded-md border border-stone-700`}
            name="handle"
            type="text"
          />
        </label>

        <label class="flex flex-col">
          App password
          <input
            class={`
            w-64 p-2 mt-1  mb-4 bg-stone-800
            rounded-md border border-stone-700`}
            name="password"
            type="password"
          />
        </label>

        <button
          class={`
              inline-flex
              text-stone-900 dark:text-stone-50
              no-underline
              p-4 mt-4
              border border-stone-500 dark:border-stone-500
              focus:outline-none focus:border-stone-900 dark:focus:border-stone-50
              rounded
            `}
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
};
