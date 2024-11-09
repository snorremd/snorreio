/** Define types of collections we can fetch likes for */
export type Collection = "blog" | "projects" | "music" | "beer" | "talks";

type Likes = {
  [slug: string]: {
    likes: number;
    liked?: boolean;
  };
};

/**
 * Make a new map of requests for each collection to avoid each Like component
 * having to fetch the likes for the collection. If the fetch has resolved, we
 * can return the likes directly from the map. If not we can wait for the fetch
 * to resolve before returning the likes.
 */
const fetchCache = new Map<Collection, Promise<Likes>>();

/**
 * Fetch likes for a specific collection.
 * If we already have a fetch in progress, we reuse the promise.
 * Otherwise we create a new fetch and store the promise in the cache.
 * @param collection
 * @returns
 */
export async function fetchLikesByCollection(
  collection: Collection,
): Promise<Likes> {
  if (!fetchCache.has(collection)) {
    const promise = fetch(`/api/likes?collection=${collection}`).then(
      (res) => res.json() as Promise<Likes>,
    );
    fetchCache.set(collection, promise);
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  return fetchCache.get(collection)!;
}

/**
 * Clear the cache for a specific collection.
 * @param collection the name of the collection
 */
export function clearLikesCache(collection: Collection) {
  fetchCache.delete(collection);
}
