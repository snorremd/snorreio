import { AppBskyFeedDefs } from "@atproto/api";
import type {
  BlockedPost,
  NotFoundPost,
  ThreadViewPost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export interface ThreadViewPostUI extends ThreadViewPost {
  showParentReplyLine: boolean;
  showChildReplyLine: boolean;
  isHighlightedPost: boolean;
}

function isKnownType(
  post: unknown,
): post is BlockedPost | NotFoundPost | ThreadViewPost {
  return [
    AppBskyFeedDefs.isBlockedPost(post),
    AppBskyFeedDefs.isNotFoundPost(post),
    AppBskyFeedDefs.isThreadViewPost(post),
  ].some(Boolean);
}

/**
 * Given a thread yield all posts in the thread as a flat list.
 * Order by parents first, then replies in order of the last child first.
 * Logic is based on the bsky.app flattenFeed function: https://github.com/bluesky-social/social-app/blob/b5511e1450617dd6978bd6765b14674cc68bae84/src/view/com/post-thread/PostThread.tsx#L329
 * This was done to ensure the same order of posts is presented in my comment section as the bsky.app.
 * @param thread The thread view post to flatten
 * @returns A generator that yields all posts in the thread including blocked and not found posts
 */
export function* flatten(
  thread: ThreadViewPostUI,
): Generator<ThreadViewPostUI, void> {
  if (thread.parent) {
    if (isKnownType(thread.parent)) {
      if (AppBskyFeedDefs.isThreadViewPost(thread.parent)) {
        yield* flatten(thread.parent as ThreadViewPostUI);
      }
    }
  }

  yield thread;

  if (thread.replies && thread.replies.length > 0) {
    for (const reply of thread.replies) {
      if (isKnownType(reply)) {
        if (AppBskyFeedDefs.isThreadViewPost(reply)) {
          yield* flatten(reply as ThreadViewPostUI);
        }
      }
    }
  }
}

function addThreadUIData(
  threadViewPost: ThreadViewPostUI,
  walkChildren = true,
  walkParent = true,
): ThreadViewPostUI {
  let parent: ThreadViewPostUI | undefined = undefined;
  if (walkParent && AppBskyFeedDefs.isThreadViewPost(threadViewPost.parent)) {
    // Recursively add UI data to parent
    parent = addThreadUIData(
      {
        ...threadViewPost.parent,
        showParentReplyLine: !!threadViewPost.parent?.parent,
        showChildReplyLine: true,
        isHighlightedPost: false,
      },
      false,
      true,
    );
  }

  let replies: ThreadViewPostUI[] = [];
  if (walkChildren && (threadViewPost.replies?.length ?? 0) > 0) {
    replies = (threadViewPost.replies ?? [])
      .map((reply) => {
        if (AppBskyFeedDefs.isThreadViewPost(reply)) {
          // Recursively add UI data to children
          return addThreadUIData(
            {
              ...reply,
              showParentReplyLine: !threadViewPost?.isHighlightedPost,
              showChildReplyLine: (reply?.replies?.length ?? 0) > 0,
              isHighlightedPost: false,
            } satisfies ThreadViewPostUI,
            true,
            false,
          );
        }
      })
      .filter((x): x is ThreadViewPostUI => x !== undefined);
  }

  return { ...threadViewPost, parent, replies };
}

export function enrichThreadWithUIData(
  threadViewPost: ThreadViewPost,
): ThreadViewPostUI {
  return addThreadUIData(
    {
      ...threadViewPost,
      showParentReplyLine: false,
      showChildReplyLine: false,
      isHighlightedPost: true,
    } satisfies ThreadViewPostUI,
    true,
    true,
  );
}
