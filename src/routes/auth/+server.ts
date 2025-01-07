import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { eq } from 'drizzle-orm';
import type { RequestEvent } from "../$types";
import { verifyPassword } from "$lib/server/password";

type LoginReq = {
  email: string;
  password: string;
}

export async function POST({ request }: RequestEvent) {
  const body = await request.json() as LoginReq;

  const dbUsers = await db.select()
    .from(user)
    .where(eq(user.email, body.email))
    .limit(1);
  if (dbUsers.length === 0) {
    return new Response(null, { status: 401 });
  }
  const dbUser = dbUsers[0];

  const ok = await verifyPassword(body.password, dbUser.password);
  if (!ok) {
    return new Response(null, { status: 401 });
  }

  return new Response(JSON.stringify({
    name: dbUser.name,
    email: dbUser.email
  }), { status: 200 });
}
