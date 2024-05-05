import { Icon } from "astro-icon/components";
import { type Component, createEffect, createSignal, onMount, createResource } from "solid-js";
import { VsHeart, VsHeartFilled } from "solid-icons/vs";

interface LikesProps {
  slug: string;
}

const fetchLikes = async (slug: string) => {
  const res = await fetch(`/api/likes/${slug}`);
  const data = await res.json() as { likes: number, liked: boolean };
  return data;
}

export const Likes: Component<LikesProps> = ({ slug }) => {

  const [likes, { refetch }] = createResource(() => slug, fetchLikes);

  return (
    <div class="flex flex-row gap-2 text-stone-800 dark:text-stone-400">
      <span>{likes()?.likes}</span>
      <button
        class=""
        onClick={async () => {
          await fetch(`/api/likes/${slug}`, {
            method: "POST",
          });
          refetch()
        }}
      >
        {likes()?.liked ? <VsHeartFilled /> : <VsHeart />}
      </button>
    </div>
  );
}