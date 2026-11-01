import { z } from "zod";
import { body, handle } from "@/lib/api";
import { createSample } from "@/lib/store";

// Paste many posts at once, separated by a line containing only "---".
export const POST = handle(async (req: Request) => {
  const { text } = await body(req, z.object({ text: z.string() }));
  const posts = text.split(/^\s*-{3,}\s*$/m).map((p) => p.trim()).filter((p) => p.length > 20);
  for (const p of posts) await createSample({ text: p });
  return { created: posts.length };
});
