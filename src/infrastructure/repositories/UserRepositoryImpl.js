import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
export function createUserRepository() {
  async function findByUsername(username) {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .all();

    if (results.length === 0) return null;
    return results[0];
  }

  async function save(user) {
    const existing = await findByUsername(user.username);
    if (existing) {
      await db
        .update(users)
        .set({
          passwordHash: user.passwordHash,
        })
        .where(eq(users.username, user.username))
        .run();
    } else {
      await db
        .insert(users)
        .values({
          id: user.id || `user-custom-${Date.now()}`,
          username: user.username,
          passwordHash: user.passwordHash,
        })
        .run();
    }
    return findByUsername(user.username);
  }

  return { findByUsername, save };
}
