import { BskyAgent, RichText } from "@atproto/api";
import { Accessor, Setter, createEffect, createSignal, on, onMount } from "solid-js";

import type { ThreadViewPostUI } from "./utils";

interface DialogProps {
  showEditor: Accessor<ThreadViewPostUI | null>;
  setShowEditor: Setter<ThreadViewPostUI | null>;
  agent: Accessor<BskyAgent | undefined>;
  refetch: () => void;
}


export const Reply = ({ agent, showEditor, setShowEditor, refetch }: DialogProps) => {
  const [editorText, setEditorText] = createSignal(new RichText({ text: "" }));
  let dialog: HTMLDialogElement | null = null;

    

  createEffect(() => {
    if(dialog && showEditor() !== null) {
      console.log("Showing dialog");
      dialog?.showModal();
    } 
    
  }, [showEditor, dialog]);

  return (
    <>{showEditor() !== null && (<dialog
      open={showEditor() !== null}
      // When user clicks outside of dialog, close it
      onClick={(e) => {
        if (e.target === dialog) {
          setShowEditor(null);
        }
      }}
      // When user presses escape, close it
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setShowEditor(null);
        }
      }}
      ref={(el) => (dialog = el)}
      class={`
      fixed inset-0 z-50
      flex flex-col items-center justify-center
      bg-stone-200 dark:bg-stone-800 backdrop:bg-gray-800 backdrop:bg-opacity-50
      text-stone-900 dark:text-stone-100 w-96
      drawn-radius-sm
      shadow-2xl
      p-6
      `}
    >
      <form class="flex flex-col items-end gap-2 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          if(agent() && showEditor() !== null) {
            const post = showEditor()!
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
        <span class="font-shortstack text-stone-400">{editorText().length} / 300</span>
        <textarea
          class={`w-full p-2 mt-1 mb-4 h-40
          bg-transparent
          drawn-radius-sm
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
          onCut={(e) =>
            setEditorText(new RichText({ text: "" }))
          }
        />
        <div class="flex flex-row gap-2 w-full justify-between">
          <button
            type="button"
            class={`
            drawn-radius
          font-shortstack text-sm
          border border-stone-700 dark:border-stone-300 p-2
          text-stone-800 dark:text-stone-100
            hover:rotate-2
        `}
            onClick={() => setShowEditor(null)}
          >
            Nevermind
          </button>
        <button type="submit" class={`
        flex flex-row items-center gap-2
          font-shortstack text-sm
          border border-stone-700  dark:border-stone-300 p-2
           text-stone-800 dark:text-stone-100 drawn-radius
           hover:rotate-2
        `}>Share thoughts</button>
        </div>
      </form>
    </dialog>)}
    </>)
};
