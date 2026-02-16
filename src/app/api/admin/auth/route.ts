import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

/**
 * POST /api/admin/auth
 * Login with email and password.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession();

  return Response.json({ success: true });
}

/**
 * DELETE /api/admin/auth
 * Logout (destroy session).
 */
export async function DELETE(): Promise<Response> {
  await destroySession();
  return Response.json({ success: true });
}
