import Link from "next/link";
import { env } from "@/lib/config/env";
import { loadCachedPreferences } from "@/lib/progress/load-preferences";
import { loadProgress } from "@/lib/progress/load-progress";
import type {
  DegradedSource,
  ProgressAggregate,
} from "@/lib/progress/types";
import { preferencesStoreKind } from "@/lib/progress/preferences-repo";
import { BreakdownModal } from "./breakdown-modal";
import { PreferencesForm } from "./preferences-form";

export const dynamic = "force-dynamic";

const DEMO_LINKS: { href: string; label: string }[] = [
  { href: "/progress", label: "Ready" },
  { href: "/progress?fail=volume", label: "Degraded (volume)" },
  { href: "/progress?fail=rank", label: "Error (rank)" },
  { href: "/progress?empty=1", label: "Empty rows" },
];

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{
    fail?: string;
    empty?: string;
    distId?: string;
  }>;
}) {
  const params = await searchParams;
  const distId = params.distId ?? env.defaultDistId;
  const returnQuery = new URLSearchParams();
  if (params.fail) returnQuery.set("fail", params.fail);
  if (params.empty) returnQuery.set("empty", params.empty);
  if (params.distId) returnQuery.set("distId", params.distId);
  const returnTo = returnQuery.size
    ? `/progress?${returnQuery.toString()}`
    : "/progress";

  const [preferences, progress] = await Promise.all([
    loadCachedPreferences(distId),
    loadProgress({ fail: params.fail, empty: params.empty }),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">
        Progress via <code>/backend/progress</code>
        {env.backendOrigin
          ? ` · rewrite destination baked at build: ${env.backendOrigin}`
          : " · rewrite destination is this app’s /api (BACKEND_ORIGIN unset)"}
      </p>

      <nav className="flex flex-wrap gap-2 text-sm">
        {DEMO_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {progress.degraded.length > 0 ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Degraded sources: {progress.degraded.join(", ")}. The rest of the
          payload still returned.
        </p>
      ) : null}

      <ProgressShell progress={progress} />

      <PreferencesForm
        distId={distId}
        preferences={preferences}
        returnTo={returnTo}
        storeKind={preferencesStoreKind()}
      />

      <BreakdownModal
        hideEmpty={preferences?.hideEmptyBreakdownRows ?? false}
        requirements={progress.requirements}
        requirementsDegraded={progress.degraded.includes("requirements")}
      />
    </div>
  );
}

function ProgressShell({ progress }: { progress: ProgressAggregate }) {
  if (progress.degraded.includes("rank") || !progress.rank) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950">
        <p className="font-medium">Rank progress unavailable.</p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          The rank service failed. Volume and preferences can still load.
        </p>
        {progress.volume ? (
          <VolumeLine volume={progress.volume} />
        ) : null}
      </section>
    );
  }

  const { currentRank, nextRank, percent } = progress.rank;

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm">
          <span className="font-medium">{currentRank}</span>
          <span className="text-zinc-500"> → {nextRank}</span>
        </p>
        <p className="text-sm tabular-nums text-zinc-500">{percent}%</p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to next rank"
      >
        <div className="h-full bg-emerald-600" style={{ width: `${percent}%` }} />
      </div>
      {progress.volume ? (
        <VolumeLine volume={progress.volume} />
      ) : progress.degraded.includes("volume" as DegradedSource) ? (
        <p className="text-sm text-zinc-500">Volume unavailable.</p>
      ) : null}
    </section>
  );
}

function VolumeLine({
  volume,
}: {
  volume: NonNullable<ProgressAggregate["volume"]>;
}) {
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      PV {volume.personalVolume} · OV {volume.organizationVolume}
    </p>
  );
}
