/**
 * A simple API route that handles user likes for a given slug.
 * This will initially be used to like blog posts, but there is no reason it can't be used for other things.
 * The API is based on Cloudflare D1, a SQLite based/compatible database.
 * We use Drizzle ORM on top to get some query building and type safety.
 */

import type { APIContext, AstroConfig } from "astro";
import { count, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { likes } from "../../db-schema/likes";

// API routes should be run on demand, not pre-computed at build time
export const prerender = false;

/**
 * Fetch the number of likes for a given slug and whether the current session has liked it.
 */
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

export async function POST(context: APIContext) {
  console.log("Runtime", context);
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

  const sessionId = context.cookies.get("sessionId")?.value ?? "";

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
