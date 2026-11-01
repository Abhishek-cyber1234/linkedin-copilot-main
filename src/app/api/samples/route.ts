import { body, handle } from "@/lib/api";
import { SampleInput } from "@/lib/schemas";
import { createSample, listSamples } from "@/lib/store";

export const GET = handle(async () => await listSamples());
export const POST = handle(async (req: Request) => await createSample(await body(req, SampleInput)));
