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