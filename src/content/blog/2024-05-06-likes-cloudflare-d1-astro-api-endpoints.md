---
pubDate: "2024-05-06"
title: "A likes feature with Cloudflare D1 and Astro API endpoints"
---

I've always had a goal of keeping Snorre.io a privacy-friendly website.
However, this privacy-friendly approach does come with a trade-off.
It means that I have a limited amount of insight into what content people enjoy the most.
This is because I prioritize your privacy over extensive data collection.
Cloudflare provides some statistics for my domain, including the number of unique visitors the domain receives per day, week, and month.
If Cloudflare is to be believed, at the time of this writing I've had about 3.3 thousand unique visitors in the past month.
I have yet to learn which blog posts they read.
To help me gauge the interest in my content, I needed some form of like system, so why not build one?

## The likes feature

You have undoubtedly seen them, the claps emoji adorning a blog post on Medium.com or a heart or thumbs up on some blog.
The number of likes indicates how many people might have found the content worth reading, watching, or listening to.
I had a few requirements I wanted to satisfy when building my like system. It should:
- be easy to use, but not in your face
- not require user registration or collection of personal information
- prevent like-spam
- allow liking blog posts, recordings, beer recipes, etc

Based on these requirements, it was clear I needed some form of backend capable of storing the likes.
Each like would be associated with a collection (e.g. blog), slug (content identifier), and session ID.
The session ID would tie a like to a user session, but not allow for the identification of a specific user.

## Implementation

As I am already running on Cloudflare, I found [Cloudflare D1](https://blog.cloudflare.com/building-d1-a-global-database) a compelling tool to persist the likes.
D1 is a global "serverless" relational database built by Cloudflare.
It uses the SQLite dialect for its SQL queries making it easy to use SQLite for local development.
They automatically handle creating read replicas based on your Cloudflare Pages or Worker DB usage.
This way, reads should always be reasonably fast, while writes must be routed to the write instance.

D1 has a low-level client library for JavaScript, but I wanted something to help me with migrations and query building.
I'm normally very skeptical of ORMs, but I recalled having read good things about [Drizzle](https://orm.drizzle.team/) in the past.
Their tag-line really resonated with me:

> Drizzle is a good friend who’s there for you when necessary and doesn’t bother when you need some space.

This is exactly what I want from an ORM.
It should not force me to do things in a specific way, but it should provide me helpers when I need them.


### DB schema

Given the aforementioned requirements, I ended up with a simple schema for the likes table:

```typescript
import { primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const likes = sqliteTable('likes', {
  sessionId: text('session_id'),
  collection: text('collection'),
  slug: text('slug'),
}, likes => {
  return {
    pk: primaryKey({ columns: [likes.sessionId, likes.collection, likes.slug] }),
  }
});
```

This schema defines a `likes` table with three columns:
- `sessionId` is a string that identifies a user session
- `collection` is a string that identifies the collection of content the like is associated with
- `slug` is a string that identifies the specific content the like is associated with

The primary key is a composite key of all the columns to ensure that a user can only like a piece of content once per session.
I could have added a `createdAt` column to store the time of the like, but this seems unnecessary for now.

### API endpoints

I did not want to change away from static site generation, so I needed a way to interact with the D1 database from my Astro site.
Fortunately Astro provides a concept called `adapters` that allows you to run Astro in various serverless environments.
The [Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) is a perfect fit for my use case.
It supports a [hybrid](https://docs.astro.build/en/basics/rendering-modes/#on-demand-rendered) rendering approach where the site is mostly static, but with some on-demand rendered pages.
I could then keep my site as is, but add a few dynamic API page routes to handle likes!

I ended up with a `/pages/api/likes.ts` file with a `GET` and `POST` function to fetch and add/remove likes.

The post function loads the JSON body from the request.
Then checks if the user has a session ID cookie, and creates one if not.
Finally, it toggles the like for the given slug and collection based on the session ID before returning a success response.

```typescript
export async function POST(context: APIContext) {
  const runtime = context.locals.runtime;
  const d1 = runtime.env.DB;
  const db = drizzle(d1, { schema: { likes } });

  const { slug = "", collection = "" } = (await context.request.json()) as {
    slug?: string;
    collection?: string;
  };

  if (!context.cookies.has("sessionId")) {
    context.cookies.set("sessionId", crypto.randomUUID(), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const sessionId = context.cookies.get("sessionId")!.value;

  const liked =
    ((
      await db
        .select({ likes: count() })
        .from(likes)
        .where(and(eq(likes.slug, slug), eq(likes.sessionId, sessionId)))
    ).at(0)?.likes ?? 0) > 0;

  if (liked) {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.slug, slug),
          eq(likes.collection, collection),
          eq(likes.sessionId, sessionId),
        ),
      )
      .execute();
  } else {
    await db.insert(likes).values({ slug, sessionId, collection }).execute();
  }

  return new Response(JSON.stringify({ success: true }));
}
```

The GET functions is no more complex.
It fetches the slug and collection from the query parameters.
Then it fetches the session ID from the cookie.
It then queries the database for the number of likes and whether the user has liked the content before returning the result.
Because we don't want to unecessarily add cookies to a user's browser, we never set a cookie for a data retrieval request.

```typescript
export async function GET(context: APIContext) {
  const runtime = context.locals.runtime;
  const d1 = runtime.env.DB;
  const db = drizzle(d1, { schema: { likes } });

  // Get slug and collection from query parameters
  const slug = context.url.searchParams.get("slug") ?? "";
  const collection = context.url.searchParams.get("collection") ?? "";
  // Get the session ID from the cookie
  const sessionId = context.cookies.get("sessionId")?.value;

  console.log("Slug", slug, "Collection", collection);

  const likesCount = (
    await db
      .select({ likes: count() })
      .from(likes)
      .where(and(eq(likes.slug, slug), eq(likes.collection, collection)))
  ).at(0)?.likes;
  let liked = false;
  if (sessionId) {
    const sessionCount =
      (
        await db
          .select({ likes: count() })
          .from(likes)
          .where(and(eq(likes.slug, slug), eq(likes.sessionId, sessionId)))
      ).at(0)?.likes ?? 0;
    liked = sessionCount > 0;
  }

  return new Response(JSON.stringify({ likes: likesCount, liked }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

### Client side Like counter and button

To allow dynamic rendering of likes count and allowing users to like content I added a simple `Likes` component to my Astro setup.
Astro supports client side rendering using something called [Astro Islands](https://docs.astro.build/en/concepts/islands/).
I decided to use [Solid.js](https://www.solidjs.com/) for the client side rendering as I was already using it for my comments system.
The whole implementation ended up being 35 lines of code:

```typescript
import { type Component, createResource } from "solid-js";
import { VsHeart, VsHeartFilled } from "solid-icons/vs";

interface LikesProps {
  slug: string;
  collection: string;
}

const fetchLikes = async ({slug, collection}: LikesProps) => {
  const res = await fetch(`/api/likes?slug=${slug}&collection=${collection}`);
  const data = await res.json() as { likes: number, liked: boolean };
  return data;
}

export const Likes: Component<LikesProps> = ({ slug, collection }) => {
  const [likes, { refetch }] = createResource(() => ({ slug, collection }), fetchLikes);

  return (
    <div class="flex flex-row gap-2 text-stone-800 dark:text-stone-400">
      <span>{likes()?.likes}</span>
      <button
        class=""
        onClick={async () => {
          await fetch(`/api/likes`, {
            method: "POST",
            body: JSON.stringify({ slug, collection }),
          });
          refetch()
        }}
      >
        {likes()?.liked ? <VsHeartFilled /> : <VsHeart />}
      </button>
    </div>
  );
}
```

The whole thing ends up compiling to less than 20 kilobytes of JavaScript (compressed) having a negligible impact on the performance of the site.

### Tooling, local environment and Cloudflare

To develop and test this locally was a bit more complex than I had hoped.
Fortunately I found an [informative blog post](https://kevinkipp.com/blog/going-full-stack-on-astro-with-cloudflare-d1-and-drizzle/) by Kevin Kipp that helped me get started.
Note that the Astro config for the Cloudflare adapter has changed since Kevin's post.
As of Astro Cloudflare adapter version `10.2.5` you want to use the following configuration:

```typescript
{
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: true,
    }
  })
}
```

Feel free to check out my [source code](https://github.com/snorremd/snorreio) for a complete example of how to use Cloudflare D1 with Astro.


## Conclusion

I now have a simple like system that allows me to gauge the interest in my content.
It is privacy-friendly, easy to use, and does not require user registration.
The like system is a bit vulnerable to abuse as you can like content multiple times by clearing your cookies.
But this is a risk I'm willing to take to keep the site privacy-friendly.

If you enjoyed this blog post, please give it a like!
