import { type Component, createResource } from "solid-js";
import { VsHeart, VsHeartFilled } from "solid-icons/vs";

interface LikesProps {
  slug: string;
  collection: string;
}

const fetchLikes = async ({ slug, collection }: LikesProps) => {
  const res = await fetch(`/api/likes?slug=${slug}&collection=${collection}`);
  const data = (await res.json()) as { likes: number; liked: boolean };
  return data;
};

export const Likes: Component<LikesProps> = ({ slug, collection }) => {
  const [likes, { refetch, mutate }] = createResource(
    () => ({ slug, collection }),
    fetchLikes,
  );

  return (
    <div class="flex flex-row gap-2 text-stone-800 dark:text-stone-400">
      <button
        type="button"
        class=""
        onClick={async () => {
          await fetch("/api/likes", {
            method: "POST",
            body: JSON.stringify({ slug, collection }),
          });
          mutate((prev) => {
            const previous = prev ?? { likes: 0, liked: false };
            return {
              likes: previous.likes + (previous.liked ? -1 : 1),
              liked: !previous.liked,
            };
          });
          refetch();
        }}
      >
        {likes()?.liked ? <VsHeartFilled /> : <VsHeart />}
      </button>
      <span>{likes()?.likes ?? 0}</span>
    </div>
  );
};
