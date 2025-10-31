import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    id: token,
    expiresAt,
  });

  return token;
}

export async function getSession(token: string) {
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token))
    .limit(1);

  if (!session[0]) return null;

  // Check if expired
  if (session[0].expiresAt && new Date() > session[0].expiresAt) {
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }

  return session[0];
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}
