import {
  Component,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import {
  AtpSessionData,
  BskyAgent
} from "@atproto/api";

import 'solid-devtools'


import { Header } from "./Header";
import { LoginForm } from "./LoginForm";
import { Thread } from "./Thread";

interface CommentsProps {
  postId: string;
  handle: string;
}

export const Comments: Component<CommentsProps> = ({ postId, handle }) => {
  const [session, setSession] = createSignal<AtpSessionData>();
  const [agent, setAgent] = createSignal<BskyAgent>();

  onMount(() => {
    const session = localStorage.getItem("atpSession");
    const agent = new BskyAgent({
      service: "https://bsky.social",
      persistSession: (evt, session) => {
        if (session) {
          localStorage.setItem("atpSession", JSON.stringify(session));
        }
        setSession(session);
      },
    });
    setAgent(agent);

    if (session) {
      agent.resumeSession(JSON.parse(session));
    }
  });

  createEffect(() => {
    if (agent() === undefined) {
      localStorage.removeItem("atpSession");
    }
  });
  

  return (
    <div class="w-full text-stone-900 dark:text-stone-100 flex flex-col gap-8">
      <Header agent={agent} session={session} signOut={() => {
        if (agent()) {
          setSession(undefined);
          setAgent(undefined);
        }
      }}/>
      <main>
        {!session() ? (
          // User is not logged in, show login form
          <LoginForm agent={agent} handle={handle} postId={postId} />
        ) : null}
        {session() ? (
          <Thread agent={agent} postId={postId} handle={handle} />
        ) : null}
      </main>
    </div>
  );
};

