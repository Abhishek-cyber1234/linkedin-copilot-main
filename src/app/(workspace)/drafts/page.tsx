import Link from "next/link";
import { Empty, LinkButton, PageHeader } from "@/components/ui";
import { listDrafts } from "@/lib/store";
import { DRAFT_STATUSES } from "@/lib/types";

const fmt = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default async function DraftsPage() {
  const drafts = await listDrafts();
  const groups = DRAFT_STATUSES.map((s) => ({ ...s, items: drafts.filter((d) => d.status === s.value) })).filter((g) => g.items.length);
  return (
    <>
      <PageHeader
        title="Drafts"
        subtitle="Write, edit, and schedule your posts."
        actions={
          <>
            <LinkButton href="/drafts/new" variant="primary">
              + New draft
            </LinkButton>
          </>
        }
      />
      {groups.length === 0 ? (
        <Empty>No drafts yet. Start one, or turn an idea into a draft from the idea bank.</Empty>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.value}>
              <h2 className="mb-3 text-sm font-semibold">
                {g.emoji} {g.label} <span className="font-normal text-ink-faint">{g.items.length}</span>
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-paper-raised">
                {g.items.map((d) => (
                  <li key={d.id}>
                    <Link href={`/drafts/${d.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-paper-sunk/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{d.title}</p>
                        <p className="truncate text-sm text-ink-soft">{d.body.split("\n").find((l) => l.trim())}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {d.status === "posted" && d.postedAt ? `Posted ${fmt(d.postedAt)}` : d.scheduledFor ? `📅 ${fmt(d.scheduledFor)}` : fmt(d.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
