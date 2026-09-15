import type { ReactNode } from "react";
import { env } from "@/lib/config/env";

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Capstone D · spike stage {env.spikeStage}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Rank progress
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Server shell for the bar. Client modal for the breakdown. Prefs are
          ours; numbers are aggregated mocks.
        </p>
      </header>
      {children}
    </div>
  );
}
