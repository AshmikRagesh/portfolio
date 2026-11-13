// ── Feedback: image storage ───────────────────────────────────────────────────
// Private Vercel Blob when BLOB_READ_WRITE_TOKEN is set. Without it, on `next dev`
// only, images are kept in memory so the feature can be tried locally (they're gone
// when the dev server restarts). In production without Blob, images are off.

import { get, put } from "@vercel/blob";

const blobReady = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const devMemory = () => process.env.NODE_ENV !== "production" && !blobReady();

const memory: Map<string, Buffer> =
  ((globalThis as { __feedbackImages?: Map<string, Buffer> }).__feedbackImages ??= new Map());

/** True when the image button should show. */
export const imagesEnabled = () => blobReady() || devMemory();

export async function saveImage(pathname: string, bytes: Buffer) {
  if (devMemory()) {
    memory.set(pathname, bytes);
    return;
  }
  await put(pathname, bytes, { access: "private", contentType: "image/jpeg", addRandomSuffix: false });
}

export async function readImage(pathname: string): Promise<ReadableStream<Uint8Array> | Uint8Array<ArrayBuffer> | null> {
  if (devMemory()) {
    const bytes = memory.get(pathname);
    return bytes ? new Uint8Array(bytes) : null;
  }
  if (!blobReady()) return null;
  const found = await get(pathname, { access: "private" });
  return found && "stream" in found && found.stream ? found.stream : null;
}
