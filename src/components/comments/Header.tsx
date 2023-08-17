import type { AtpSessionData, BskyAgent } from "@atproto/api";
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { Popover } from "@kobalte/core";
import { createSignal, type Accessor, type Component, createEffect } from "solid-js";

interface HeaderProps {
  agent: Accessor<BskyAgent | undefined>;
  session: Accessor<AtpSessionData | undefined>;
  signOut: () => void;
}


export const Header: Component<HeaderProps> = ({ agent, session, signOut }) => {

  const [profile, setProfile] = createSignal<ProfileViewDetailed>();
  createEffect(async () => {
    if (agent() && session()) {
      const profile = await agent()!.getProfile({
        actor: agent()!.session!.handle,
      });
      profile.success && setProfile(profile.data);
    } else {
      setProfile(undefined);
    }
  });

  return (
    <header class="w-full flex flex-row justify-between">
      <h2 class="pb-4 text-3xl font-shortstack">Comments</h2>
        <div>
          <Popover.Root>
            <Popover.Trigger class="ui-disabled:bg-slate-100">
              <img class="w-16 rounded-full" src={profile()?.avatar} />
            </Popover.Trigger>
            <Popover.Content class={`
            ui-expanded:shadow-lg
            bg-stone-200
            dark:bg-stone-700
            mt-4 p-4
            rounded
            flex flex-col gap-2
            `}>
              <span class="font-shortstack">
                {profile()?.displayName}
              </span>
              <button onClick={signOut}>
                Sign out
              </button>
            </Popover.Content>
          </Popover.Root>
        </div>
    </header>
  );
};