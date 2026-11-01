import { notFound } from "next/navigation";
import { DraftEditor } from "@/components/DraftEditor";
import { computeStats, findSimilar } from "@/lib/memory";
import { getDraft, listSamples } from "@/lib/store";

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const draft = await getDraft((await params).id);
  if (!draft) notFound();
  const [similar, samples] = await Promise.all([findSimilar(draft.body, { excludeId: draft.id }), listSamples()]);
  const usable = samples.filter((s) => s.feedback !== "not");
  return <DraftEditor draft={draft} similar={similar} avgWords={usable.length ? computeStats(usable.map((s) => s.text)).avgWords : null} />;
}
