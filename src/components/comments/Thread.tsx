import type {
  BskyAgent,
  RichText,
  AppBskyFeedGetPostThread,
} from "@atproto/api";
import type {
  FeedViewPost,
  ThreadViewPost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  createSignal,
  type Accessor,
  type Component,
  onMount,
  createEffect,
} from "solid-js";

interface ThreadProps {
  agent: Accessor<BskyAgent | undefined>;
  postId: string;
  handle: string;
}

export const Thread: Component<ThreadProps> = ({ postId, handle, agent }) => {
  const [thread, setThread] = createSignal<ThreadViewPost>();

  createEffect(async () => {
    if (agent()) {
      const threadResult = await agent()!.getPostThread({
        uri: `at://did:plc:o34f4av7ed7szx24dqm4x3g6/app.bsky.feed.post/3jzrrunu4c22b`,
      });

      if (threadResult.success) {
        setThread(threadResult.data.thread as ThreadViewPost);
      }
    }

    console.log("thread()?.replies", thread());
  });

  return (
    <div>
      {thread()
        ? thread()!
            .replies!.filter(
              (reply): reply is ThreadViewPost =>
                reply.$type === "app.bsky.feed.defs#threadViewPost",
            )
            .map(reply => <Post post={reply} />)
        : null}
    </div>
  );
};


const Post = ({ post }: { post: ThreadViewPost }) => {
  return (
    <li class="flex flex-col">
      <div class="flex flex-row gap-4 items-start">
        <div class="flex flex-col justify-center items-center">
          <img
            class="rounded-full w-8 pb-2"
            src={post.post.author.avatar}
          />
          <span class="font-shortstack text-xs">{post.post.author.displayName}</span>
        </div>
        <div>{(post.post.record as { text: string }).text}</div>
      </div>
      <ul class="flex flex-col ml-8 pt-8">
          {post.replies?.filter(
              (reply): reply is ThreadViewPost =>
                reply.$type === "app.bsky.feed.defs#threadViewPost",
            )
            .map(reply => <Post post={reply} />)}
        </ul>
    </li>
  );
};
