import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const likes = sqliteTable(
  "likes",
  {
    sessionId: text("session_id"),
    collection: text("collection"),
    slug: text("slug"),
    // Store the timestamp of when the like was created in JavaScript milliseconds
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      // Default to epoch as alter table only supports constant default values
      .default(sql`0`),
  },
  (likes) => {
    return {
      pk: primaryKey({
        columns: [likes.sessionId, likes.collection, likes.slug],
      }),
    };
  },
);
