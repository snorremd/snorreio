import { AppBskyFeedDefs } from "@atproto/api";
import type {
  BlockedPost,
  NotFoundPost,
  ThreadViewPost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

function isKnownType(
  post: any,
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
 * 
 */
export function* flatten(
  thread: ThreadViewPost,
): Generator<ThreadViewPost | BlockedPost | NotFoundPost, void> {
  if (thread.parent) {
    if (isKnownType(thread.parent)) {
      if (AppBskyFeedDefs.isThreadViewPost(thread.parent)) {
        yield* flatten(thread.parent);
      } else if (AppBskyFeedDefs.isBlockedPost(thread.parent)) {
        console.log("blocked", thread.parent);
        yield thread.parent;
      }
    }
  }

  yield thread;

  if (thread.replies && thread.replies.length > 0) {
    for (const reply of thread.replies) {
      if (isKnownType(reply)) {
        if (AppBskyFeedDefs.isThreadViewPost(reply)) {
          yield* flatten(reply);
        } else {
          yield reply;
        }
      }
    }
  }
}
