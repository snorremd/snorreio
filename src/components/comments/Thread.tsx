import type { BskyAgent } from "@atproto/api";
import type { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  createSignal,
  type Accessor,
  type Component,
  Setter,
  createResource,
  For,
} from "solid-js";
import { formatDistance } from "date-fns";
import { VsComment, VsHeart, VsHeartFilled, VsLink } from "solid-icons/vs";
import { ThreadViewPostUI, enrichThreadWithUIData, flatten } from "./utils";
import { Reply } from "./Reply";

interface ThreadProps {
  agent: Accessor<BskyAgent | undefined>;
  atprotoURI: string;
  handle: string;
}

export const Thread: Component<ThreadProps> = ({
  atprotoURI,
  handle,
  agent,
}) => {
  const [, setPost] = createSignal<string>();
  const [showEditor, setShowEditor] = createSignal<ThreadViewPostUI | null>(
    null,
  );

  const [thread, { refetch }] = createResource<
    ThreadViewPostUI[] | undefined,
    true
  >(async () => {
    if (agent()) {
      const threadResult = await agent()!.getPostThread({
        uri: atprotoURI,
      });

      const enrichedAndFlattened = [
        ...flatten(
          enrichThreadWithUIData(threadResult.data.thread as ThreadViewPost),
        ),
      ];

      return enrichedAndFlattened;
    }
    return undefined;
  });

  return (
    <>
      {thread.state === "pending" && <p>Loading...</p>}
      {thread.state === "errored" && <p>Error: {thread.error.message}</p>}
      {thread() && (
        <ul>
          <For each={thread()}>
            {(post) => (
              <Post
                agent={agent}
                post={post}
                refetch={() => refetch()}
                setShowEditor={setShowEditor}
              />
            )}
          </For>
        </ul>
      )}
      <Reply
        agent={agent}
        showEditor={showEditor}
        setShowEditor={setShowEditor}
        refetch={refetch}
      />
    </>
  );
};

function getPostId(uri: string) {
  return uri.split("/").pop();
}

const Post = ({
  agent,
  post,
  refetch,
  setShowEditor,
}: {
  agent: Accessor<BskyAgent | undefined>;
  post: ThreadViewPostUI;
  refetch: () => void;
  setShowEditor: Setter<ThreadViewPostUI | null>;
}) => {
  const { text, createdAt } = post.post.record as {
    text: string;
    createdAt: string;
  };

  return (
    <li class={`flex flex-col`}>
      {post.showParentReplyLine ? (
        <div class="flex pt-8 ml-6 border-l-2 border-stone-400 dark:border-stone-600"></div>
      ) : null}
      <div class="flex flex-col items-start">
        <div class="flex flex-row items-center justify-center gap-2">
          <img class="rounded-full w-12" src={post.post.author.avatar} />
          <span class="font-shortstack text-lg">
            {post.post.author.displayName}
          </span>
          <span class="text-xs text-stone-600 dark:text-stone-300">
            @{post.post.author.handle}
          </span>
          <time
            class="text-xs text-stone-600 dark:text-stone-300"
            dateTime={createdAt}
          >
            {formatDistance(new Date(createdAt), new Date())}
          </time>
        </div>

        <div
          class={`
          flex flex-col gap-2 pb-4 w-full
          ${post.showParentReplyLine ? "" : ""}
          ${post.showChildReplyLine ? "border-l-2" : ""}
          border-stone-400 dark:border-stone-600 ml-6 pl-6`}
        >
          <p class="mt-0">{text}</p>
          <div class="flex flex-row gap-4 text-stone-600 dark:text-stone-400">
            <button
              class="flex flex-row items-center"
              onClick={() => setShowEditor(post)}
              aria-label={`Reply to ${post.post.author.displayName}`}
            >
              <VsComment />
              <span class="ml-1 text-sm">{post.replies?.length ?? 0}</span>
            </button>
            <button
              class="flex flex-row items-center"
              aria-label="Like"
              onClick={async () => {
                if (post.post.viewer?.like) {
                  await agent()!.deleteLike(post.post.viewer.like);
                  await refetch();
                } else {
                  await agent()!.like(post.post.uri, post.post.cid);
                  await refetch();
                }
              }}
            >
              {post.post.viewer?.like ? <VsHeartFilled /> : <VsHeart />}
              <span class="ml-1 text-sm">{post.post.likeCount}</span>
            </button>
            <a
              class="flex flex-row items-center"
              href={`https://bsky.app/profile/${
                post.post.author.handle
              }/post/${getPostId(post.post.uri)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on Bsky"
            >
              <VsLink />{" "}
              <span class="ml-1 font-shortstack text-sm">View on Bsky</span>
            </a>
          </div>
        </div>
      </div>
    </li>
  );
};
