/**
 * A simple API route that handles user likes for a given slug.
 * This will initially be used to like blog posts, but there is no reason it can't be used for other things.
 * The API is based on Cloudflare D1, a SQLite based/compatible database.
 * We use Drizzle ORM on top to get some query building and type safety.
 */

import type { APIContext, AstroConfig } from "astro";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { DB } from "kysely-codegen";

// API routes should be run on demand, not pre-computed at build time
export const prerender = false;

function groupLikes(likes: { slug: string; likes: number }[]) {
  return likes.reduce(
    (acc, like) => {
      acc[like.slug] = { likes: like.likes, liked: false };
      return acc;
    },
    {} as Record<string, { likes: number; liked: boolean }>,
  );
}

/**
 * Fetch the number of likes for a given slug and whether the current session has liked it.
 */
export async function GET(context: APIContext) {
  const runtime = context.locals.runtime;
  const db = new Kysely<DB>({
    dialect: new D1Dialect({ database: runtime.env.DB }),
  });

  // Get slug and collection from query parameters
  const slug = context.url.searchParams.get("slug");
  const collection = context.url.searchParams.get("collection") ?? "";

  // Get the session ID from the cookie
  const sessionId = context.cookies.get("sessionId")?.value;

  // Find the number of likes grouped by slug.
  // If a slug is provided, filter by it, otherwise get all likes for the collection.
  let likesQuery = db
    .selectFrom("likes")
    .select(({ fn }) => ["slug", fn.countAll<number>().as("likes")])
    .where("collection", "=", collection)
    .groupBy("slug");

  if (slug) {
    likesQuery = likesQuery.where("slug", "=", slug);
  }

  const likesGroupedBySlug = groupLikes(await likesQuery.execute());

  // Find the number of likes for session grouped by slug.
  // This way we can determine for each slug if the session has liked it or not.
  if (sessionId) {
    let sessionLikesQuery = db
      .selectFrom("likes")
      .select(({ fn }) => ["slug", fn.countAll<number>().as("likes")])
      .where("collection", "=", collection)
      .where("session_id", "=", sessionId ?? "")
      .groupBy("slug");

    if (slug) {
      sessionLikesQuery = sessionLikesQuery.where("slug", "=", slug);
    }

    const sessionLikesGroupedBySlug = await sessionLikesQuery.execute();

    for (const like of sessionLikesGroupedBySlug) {
      likesGroupedBySlug[like.slug].liked = true;
    }
  }
  return new Response(JSON.stringify(likesGroupedBySlug), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(context: APIContext) {
  const runtime = context.locals.runtime;
  const db = new Kysely<DB>({
    dialect: new D1Dialect({ database: runtime.env.DB }),
  });

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

  const sessionId = context.cookies.get("sessionId")?.value ?? "";

  const liked =
    ((
      await db
        .selectFrom("likes")
        .select(({ fn }) => fn.countAll<number>().as("likes"))
        .where("slug", "=", slug)
        .where("session_id", "=", sessionId)
        .executeTakeFirst()
    )?.likes ?? 0) > 0;

  if (liked) {
    await db
      .deleteFrom("likes")
      .where("slug", "=", slug)
      .where("collection", "=", collection)
      .where("session_id", "=", sessionId)
      .execute();
  } else {
    await db
      .insertInto("likes")
      .values({
        slug,
        session_id: sessionId,
        collection,
        // SQLite works with time as seconds since epoch, so we need to convert it to seconds
        // Should probably make this a plugin for Kysely so it's easier to work with dates
        created_at: Math.round(new Date().getTime() / 1000),
      })
      .execute();
  }

  return new Response(JSON.stringify({ success: true }));
}
