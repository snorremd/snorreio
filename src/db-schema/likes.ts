import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const likes = sqliteTable('likes', {
  sessionId: text('session_id'),
  slug: text('slug'),
}, likes => {
  return {
    unique: unique().on(likes.sessionId, likes.slug)
  }
});