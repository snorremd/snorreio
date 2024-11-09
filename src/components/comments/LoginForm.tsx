import type { AtpAgent } from "@atproto/api";
import type { Accessor, Component } from "solid-js";
import { Button } from "./Button";
import { Input } from "./Input";

interface LoginFormProps {
  agent: Accessor<AtpAgent | undefined>;
  handle: string;
  atprotoURI: string;
}

export const LoginForm: Component<LoginFormProps> = ({
  agent,
  handle,
  atprotoURI,
}) => {
  const postId = atprotoURI.split("/").pop();

  return (
    <div class="flex flex-col items-center justify-center">
      <p class="pb-4">
        Login or go to{" "}
        <a href={`https://bsky.app/profile/${handle}/post/${postId}`}>
          Bsky.app
        </a>{" "}
        to comment.
      </p>
      <form
        class="flex flex-col items-center justify-center w-full gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          console.log("Logging in");
          const formData = new FormData(e.currentTarget);
          const handle = formData.get("handle");
          const password = formData.get("password");
          if (handle && password) {
            await agent()?.login({
              identifier: handle.toString(),
              password: password.toString(),
            });
          }
        }}
      >
        {/* Insert nice looking input */}

        <label class="flex flex-col" for="handle">
          Handle
          <Input name="handle" type="text" />
        </label>

        <label class="flex flex-col" for="password">
          App password
          <Input name="password" type="password" />
        </label>

        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};
