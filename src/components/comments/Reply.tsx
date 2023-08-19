import { BskyAgent, RichText } from "@atproto/api";
import {
  Accessor,
  Setter,
  Show,
  createEffect,
  createSignal,
  on,
  onMount,
} from "solid-js";

import type { ThreadViewPostUI } from "./utils";
import { Button } from "./Button";

interface DialogProps {
  showEditor: Accessor<ThreadViewPostUI | null>;
  setShowEditor: Setter<ThreadViewPostUI | null>;
  agent: Accessor<BskyAgent | undefined>;
  refetch: () => void;
}

export const Reply = ({
  agent,
  showEditor,
  setShowEditor,
  refetch,
}: DialogProps) => {
  const [editorText, setEditorText] = createSignal(new RichText({ text: "" }));
  const [dialog, setDialog] = createSignal<HTMLDialogElement | null>(null);


  createEffect(() => {
    if(showEditor()) {
      dialog()!.showModal();
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [showEditor]);

  return (
    <Show when={showEditor()}>
      <dialog
        // When user clicks outside of dialog, close it
        onClick={(e) => {
          if (e.target === dialog()) {
            setShowEditor(null);
          }
        }}
        // When user presses escape, close it
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setShowEditor(null);
          }
        }}
        ref={(el) => setDialog(el)}
        class={`
      fixed inset-0 z-50
      flex flex-col items-center justify-center
      bg-stone-200 dark:bg-stone-800
      backdrop:bg-gray-800 backdrop:bg-opacity-50
      text-stone-900 dark:text-stone-100 w-96
      rounded-drawn-sm
      shadow-2xl
      p-6
      `}
      >
        <form
          class="flex flex-col items-end gap-2 w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            if (agent() && showEditor() !== null) {
              const post = showEditor()!;
              await agent()?.post({
                text: editorText().text,
                langs: ["en"],
                reply: {
                  parent: {
                    cid: post.post.cid,
                    uri: post.post.uri,
                  },
                  root: {
                    cid: post.post.cid,
                    uri: post.post.uri,
                  },
                },
              });
              await refetch();
              setShowEditor(null);
            }
          }}
        >
          <span class="font-shortstack text-stone-400">
            {editorText().length} / 300
          </span>
          <textarea
            class={`w-full p-2 mt-1 mb-4 h-40
          bg-transparent
          rounded-drawn-sm
          focus:outline-none
          focus:text-stone-900 dark:focus:text-stone-100
          placeholder:font-shortstack
          `}
            name="text"
            placeholder="What's on your mind?"
            value={editorText().text}
            onkeypress={(e) =>
              setEditorText(new RichText({ text: e.currentTarget.value }))
            }
            onCut={(e) => setEditorText(new RichText({ text: "" }))}
          />
          <div class="flex flex-row gap-2 w-full justify-between">
            <Button
              type="button"
              onClick={() => setShowEditor(null)}
            >
              Nevermind
            </Button>
            <Button
              type="submit"
            >
              Share thoughts
            </Button>
          </div>
        </form>
      </dialog>
    </Show>
  );
};
