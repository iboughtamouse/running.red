import { getFile } from "@/lib/r2";

/**
 * GET /api/images/[...key]
 * Proxy images from R2. Serves any R2 object by its key path.
 * E.g. /api/images/images/page-1-desktop.webp
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
): Promise<Response> {
  const { key } = await params;

  // Reject path traversal attempts
  if (key.some((segment) => segment === ".." || segment === ".")) {
    return new Response("Bad request", { status: 400 });
  }

  const r2Key = key.join("/");

  try {
    const { body, contentType } = await getFile(r2Key);

    return new Response(body, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
