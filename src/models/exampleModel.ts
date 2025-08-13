import { db } from "../db/client";
import { users, NewUser } from "../db/schema";
import { eq } from "drizzle-orm";

export async function listUsers() {
  return db.select().from(users).orderBy(users.id);
}

export async function createUser(data: NewUser) {
  const inserted = await db.insert(users).values(data).returning();
  return inserted[0];
}

export async function getUserById(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] ?? null;
}
