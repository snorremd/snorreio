import { createResource, createSignal, type ResourceReturn } from "solid-js";

export type Collection = "blog" | "projects" | "music" | "beer";

async function fetchLikes(collection: Collection) {
  const res = await fetch(`/api/likes?collection=${collection}`);
  const data = (await res.json()) as {
    [slug: string]: { likes: number; liked?: boolean };
  };
  return data;
}

// By creating empty signals we delay the fetch until the signal is set
// thereby preventing early and unnecessary fetches. Only once you go to the
// relevant page should we fetch the likes.
const [fetchBlogLikes, setFetchBlogLikes] = createSignal<Collection>();
const [fetchProjectLikes, setFetchProjectLikes] = createSignal<Collection>();
const [fetchMusicLikes, setFetchMusicLikes] = createSignal<Collection>();
const [fetchBeerLikes, setFetchBeerLikes] = createSignal<Collection>();

const blogLikes = createResource(fetchBlogLikes, fetchLikes);

const projectLikes = createResource(fetchProjectLikes, fetchLikes);

const musicLikes = createResource(fetchMusicLikes, fetchLikes);

const beerLikes = createResource(fetchBeerLikes, fetchLikes);

function toggleFetchLikes() {
  const path = window.location.pathname;
  if (path === "/blog") {
    console.log("Toggle fetch likes", window.location.pathname);
    setFetchBlogLikes("blog");
  } else if (path === "/projects") {
    setFetchProjectLikes("projects");
  } else if (path === "/music") {
    setFetchMusicLikes("music");
  } else if (path === "/beers") {
    setFetchBeerLikes("beer");
  }
}

// If browser is at /blog toggle the fetch for blog likes, etc.
// This is a somewhat hacky way to avoid fetching likes for all collections.
// We match specifically on the path to avoid fetching likes for sub pages
// If window is not undefined register a listener for document loads or location changes
if (typeof window !== "undefined") {
  toggleFetchLikes();
  window.addEventListener("load", toggleFetchLikes);
  window.addEventListener("popstate", toggleFetchLikes);
}

export const resources: {
  [coll in Collection]: ResourceReturn<
    {
      [slug: string]: {
        likes: number;
        liked?: boolean;
      };
    },
    unknown
  >;
} = {
  blog: blogLikes,
  projects: projectLikes,
  music: musicLikes,
  beer: beerLikes,
};
