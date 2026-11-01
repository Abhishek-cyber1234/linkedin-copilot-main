import { Empty, LinkButton, PageHeader } from "@/components/ui";
import { computeStats } from "@/lib/memory";
import { listSamples } from "@/lib/store";

export default async function VoicePage() {
  const samples = await listSamples();
  const usable = samples.filter((s) => s.feedback !== "not");
  const favorites = samples.filter((s) => s.feedback === "exact");
  const stats = computeStats(usable.map((s) => s.text));
  const favStats = favorites.length >= 2 ? computeStats(favorites.map((s) => s.text)) : null;

  return (
    <>
      <PageHeader title="My Voice" subtitle="How you write, measured from your writing samples. Posts marked 👎 are left out." />

      {stats.sampleCount === 0 ? (
        <Empty>
          No writing samples yet.{" "}
          <LinkButton href="/samples" variant="ghost">
            Add some posts →
          </LinkButton>
        </Empty>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="mb-4 text-sm font-semibold">By the numbers</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric value={stats.avgWords} label="words per post" />
              <Metric value={stats.avgSentenceWords} label="words per sentence" />
              <Metric value={stats.avgParagraphLines} label="lines per paragraph" />
              <Metric value={stats.emojiPerPost} label="emojis per post" />
              <Metric value={stats.emDashPerPost} label="em dashes per post" />
              <Metric value={stats.hashtagPerPost} label="hashtags per post" />
              <Metric value={`${Math.round(stats.questionEndingRate * 100)}%`} label="end with a question" />
              <Metric value={stats.sampleCount} label="samples" />
            </div>
          </section>

          {stats.topWords.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Words you use most</h2>
              <div className="flex flex-wrap gap-2">
                {stats.topWords.map((w) => (
                  <span key={w} className="chip font-serif text-[13px]">
                    {w}
                  </span>
                ))}
              </div>
            </section>
          )}

          {stats.openingWords.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">How you often open</h2>
              <div className="flex flex-wrap gap-2">
                {stats.openingWords.map((w) => (
                  <span key={w} className="chip font-serif text-[13px]">
                    &ldquo;{w}...&rdquo;
                  </span>
                ))}
              </div>
            </section>
          )}

          {favStats && (
            <section>
              <h2 className="mb-1 text-sm font-semibold">Your ❤️ posts vs. everything</h2>
              <p className="mb-4 text-sm text-ink-soft">The {favorites.length} posts you marked &ldquo;exactly like me&rdquo;, compared with all samples.</p>
              <div className="card divide-y divide-line text-sm">
                {(
                  [
                    ["Words per post", favStats.avgWords, stats.avgWords],
                    ["Words per sentence", favStats.avgSentenceWords, stats.avgSentenceWords],
                    ["Emojis per post", favStats.emojiPerPost, stats.emojiPerPost],
                    ["Hashtags per post", favStats.hashtagPerPost, stats.hashtagPerPost],
                    ["End with a question", `${Math.round(favStats.questionEndingRate * 100)}%`, `${Math.round(stats.questionEndingRate * 100)}%`],
                  ] as const
                ).map(([label, fav, all]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span>{label}</span>
                    <span className="tabular-nums text-ink-soft">
                      <span className="font-medium text-ink">{fav}</span> vs {all}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card px-4 py-3">
      <div className="font-serif text-2xl">{value}</div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}
