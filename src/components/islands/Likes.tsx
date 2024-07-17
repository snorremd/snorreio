/**
 * Display likes for a specific slug and collection.
 * Only fetches the likes for the specific slug to avoid over-fetching.
 */
import { type Component, createResource } from "solid-js";
import { resources, type Collection } from "./api/likes-api";
import { VsHeart, VsHeartFilled } from "solid-icons/vs";

interface FetchProps {
  slug: string;
  collection: Collection;
}

const fetchLikesForSlug = async ({ slug, collection }: FetchProps) => {
  const res = await fetch(`/api/likes?slug=${slug}&collection=${collection}`);
  const data = (await res.json()) as {
    [slug: string]: { likes: number; liked?: boolean };
  };
  return data;
};

interface LikesProps {
  slug: string;
  collection: Collection;
  isCollectionPage?: boolean;
}

/**
 * Likes component when we know the slug and collection
 * @param param0
 * @returns
 */
export const Likes: Component<LikesProps> = ({
  slug,
  collection,
  isCollectionPage = false,
}) => {
  // This is the globally shared resource for likes for collection pages
  // Data is only fetched when the user navigates to the specific collection page
  const [
    likesByCollection,
    { mutate: mutateByCollection, refetch: refetchByCollection },
  ] = resources[collection];

  // This is the resource for likes for a specific slug to be used
  // on specific pages, like blog posts, projects, etc. Allows us to
  // get and set likes to avoid over-fetching.
  const [likesBySlug, { mutate: mutateBySlug, refetch: refetchBySlug }] =
    createResource(
      () => (isCollectionPage ? undefined : { slug, collection }),
      fetchLikesForSlug,
    );

  const likes = isCollectionPage ? likesByCollection : likesBySlug;
  const mutate = isCollectionPage ? mutateByCollection : mutateBySlug;
  const refetch = isCollectionPage ? refetchByCollection : refetchBySlug;

  // Make wrapper around the resources to return specific slug from result map
  const likesBySlugFn = () => likes()?.[slug];
  const classes =
    "flex flex-row gap-1 items-center text-stone-800 dark:text-stone-400";

  // On non-collection pages we render a button to allow for liking
  if (!isCollectionPage) {
    return (
      <button
        type="button"
        class={classes}
        onClick={async () => {
          await fetch("/api/likes", {
            method: "POST",
            body: JSON.stringify({ slug, collection }),
          });
          mutate((prev) => {
            const previous = prev?.[slug];
            if (previous) {
              const count = previous.liked
                ? previous.likes - 1
                : previous.likes + 1;
              return {
                ...prev,
                [slug]: { likes: count, liked: !previous.liked },
              };
            }

            return prev;
          });
          refetch();
        }}
      >
        <span class="text-stone-500 dark:text-stone-400">
          {likesBySlugFn()?.liked ? <VsHeartFilled /> : <VsHeart />}
        </span>
        <span>{likesBySlugFn()?.likes ?? 0}</span>
      </button>
    );
  }

  // On collection pages we render a static like count to avoid a11y users having to tab through each like
  return (
    <div class={classes}>
      <span class="text-stone-500 dark:text-stone-400">
        {likesBySlugFn()?.liked ? <VsHeartFilled /> : <VsHeart />}
      </span>
      <span>{likesBySlugFn()?.likes ?? 0}</span>
    </div>
  );
};
