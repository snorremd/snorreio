import { BskyAgent, RichText, AppBskyFeedGetPostThread } from "@atproto/api";
import type {
  FeedViewPost,
  ThreadViewPost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  createSignal,
  type Accessor,
  type Component,
  createEffect,
  Setter,
  createResource,
  For,
} from "solid-js";
import { formatRelative,formatDistance, sub } from "date-fns"
import { VsComment, VsHeart, VsHeartFilled } from "solid-icons/vs"
import { flatten } from "./utils";

interface ThreadProps {
  agent: Accessor<BskyAgent | undefined>;
  postId: string;
  handle: string;
}

export const Thread: Component<ThreadProps> = ({ postId, handle, agent }) => {
  const [post, setPost] = createSignal<string>();

  const [thread, { mutate, refetch }] = createResource<ThreadViewPost | undefined, true>(async () => {
    if (agent()) {
      const threadResult = await agent()!.getPostThread({
        uri: `at://did:plc:o34f4av7ed7szx24dqm4x3g6/app.bsky.feed.post/3jzrrunu4c22b`,        
      });

      const thread = threadResult.data.thread as ThreadViewPost;
      console.log('Thread: ', [...flatten(thread)]);
      return thread
    }
    return undefined;
  });

  return (
    <>
    {thread.state === 'pending' && <p>Loading...</p>}
    {thread.state === 'errored' && <p>Error: {thread.error.message}</p>}
    {thread() && (
    <ul>
      <For each={thread()?.replies?.filter(
              (reply): reply is ThreadViewPost =>
                reply.$type === "app.bsky.feed.defs#threadViewPost",
            )}>
        {(reply) => (
          <Post setPost={setPost} agent={agent} post={reply} refetch={() => refetch()} />
        )}
        </For>
    </ul>
    )}
  </>

  );
};

const Post = ({
  agent,
  post,
  setPost,
  refetch
}: {
  agent: Accessor<BskyAgent | undefined>;
  post: ThreadViewPost;
  setPost: Setter<string | undefined>;
  refetch: () => void
}) => {

  const [showEditor, setShowEditor] = createSignal(false);
  const [editorText, setEditorText] = createSignal<RichText>(
    new RichText({ text: "" }),
  );

  const hasReplies = post.replies?.length ?? 0 > 0;

  return (
    <li class="flex flex-col">
      <div class="flex flex-col items-start">
        <div class="flex flex-row items-center justify-center gap-2">
          <img class="rounded-full w-12" src={post.post.author.avatar} />
          <span class="font-shortstack text-lg">
            {post.post.author.displayName}
          </span>
          <span class="text-xs text-stone-300">
            @{post.post.author.handle}
          </span>
          <time class="text-xs text-stone-300" dateTime={post.post.record.createdAt}>
            {formatDistance(new Date(post.post.record.createdAt), new Date())}
          </time>
        </div>
        <div class={`flex flex-col gap-2 pb-4 w-full ${hasReplies ? 'border-l-2' : ""} border-stone-600 ml-6 pl-6`}>
          <p class="mt-0">{(post.post.record as { text: string }).text}</p>
          <div class="flex flex-row gap-4 text-stone-400">
            <button class="flex flex-row items-center" onClick={() => setShowEditor(!showEditor())} aria-label={`Reply to ${post.post.author.displayName}`}>
              <VsComment />
              <span class="ml-1 text-sm">
              {post.replies?.length ?? 0}
              </span>
            </button>
            <button class="flex flex-row items-center" aria-label="Like" onClick={async () => {
              if(post.post.viewer?.like) {
                await agent()!.deleteLike(post.post.viewer.like)
                await refetch()
              } else {
                await agent()!.like(post.post.uri, post.post.cid)
                await refetch()
              }
            }}>
              {post.post.viewer?.like ? <VsHeartFilled /> : <VsHeart />}
              <span class="ml-1 text-sm">
                {post.post.likeCount}
              </span>
            </button>
          </div>
          
          {showEditor() ? (
            <form
              class="mt-4 flex flex-col items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                if (agent()) {
                  const reply = await agent()!.post({
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
                  setPost(reply.cid);
                }
              }}
            >
              <textarea
                class="w-full p-2 mt-1 mb-4 bg-stone-900 rounded-md border border-stone-700"
                name="text"
                value={editorText()?.text}
                onkeypress={(e) =>
                  setEditorText(new RichText({ text: e.currentTarget.value }))
                }
              />
              <span>{editorText().length} / 140</span>
              <button type="submit">Submit</button>
            </form>
          ) : null}
        </div>
      </div>
        <For each={post.replies
          ?.filter(
            (reply): reply is ThreadViewPost =>
              reply.$type === "app.bsky.feed.defs#threadViewPost",
          )} >
          {(reply) => (<Post setPost={setPost} agent={agent} post={reply} refetch={refetch} />)}
        </For>
    </li>
  );
};
