import { BskyAgent, RichText, AppBskyFeedGetPostThread } from "@atproto/api";
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
  on,
  Setter,
} from "solid-js";

interface ThreadProps {
  agent: Accessor<BskyAgent | undefined>;
  postId: string;
  handle: string;
}

export const Thread: Component<ThreadProps> = ({ postId, handle, agent }) => {
  const [post, setPost] = createSignal<string>();
  const [thread, setThread] = createSignal<ThreadViewPost>();

  createEffect(async () => {
    post() // Force update
    if (agent()) {
      const threadResult = await agent()!.getPostThread({
        uri: `at://did:plc:o34f4av7ed7szx24dqm4x3g6/app.bsky.feed.post/3jzrrunu4c22b`,
      });

      if (threadResult.success) {
        setThread(threadResult.data.thread as ThreadViewPost);
      }
    }
  });

  return (
    <div>
      {thread()
        ? thread()!
            .replies!.filter(
              (reply): reply is ThreadViewPost =>
                reply.$type === "app.bsky.feed.defs#threadViewPost",
            )
            .map((reply) => <Post setPost={setPost} agent={agent} post={reply} />)
        : null}
    </div>
  );
};

const Post = ({
  agent,
  post,
  setPost
}: {
  agent: Accessor<BskyAgent | undefined>;
  post: ThreadViewPost;
  setPost: Setter<string | undefined>;
}) => {
  const [showEditor, setShowEditor] = createSignal(false);
  const [editorText, setEditorText] = createSignal<RichText>(
    new RichText({ text: "" }),
  );
  return (
    <li class="flex flex-col">
      <div class="flex flex-row gap-4 items-start">
        <div class="flex flex-col justify-center items-center">
          <img class="rounded-full w-8 pb-2" src={post.post.author.avatar} />
          <span class="font-shortstack text-xs">
            {post.post.author.displayName}
          </span>
        </div>
        <div class="flex flex-col w-full">
          <p>{(post.post.record as { text: string }).text}</p>
          {!showEditor() ? (
            <div class="flex flex-row gap-4 justify-end">
              <button onClick={() => setShowEditor(true)}>Reply</button>
            </div>
          ) : null}
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
      <ul class="flex flex-col ml-8 pt-8">
        {post.replies
          ?.filter(
            (reply): reply is ThreadViewPost =>
              reply.$type === "app.bsky.feed.defs#threadViewPost",
          )
          .map((reply) => <Post setPost={setPost} agent={agent} post={reply} />)}
      </ul>
    </li>
  );
};