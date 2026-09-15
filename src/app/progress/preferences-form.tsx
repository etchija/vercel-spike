import { saveProgressPreferences } from "./actions";
import type { ProgressPreferences } from "@/lib/progress/types";

export function PreferencesForm({
  distId,
  preferences,
  returnTo,
  storeKind,
}: {
  distId: string;
  preferences: ProgressPreferences | null;
  returnTo: string;
  storeKind: "postgres" | "memory";
}) {
  const hideEmpty = preferences?.hideEmptyBreakdownRows ?? false;

  return (
    <form
      action="/api/preferences"
      method="post"
      className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
    >
      <input type="hidden" name="distId" value={distId} />
      <input type="hidden" name="next" value={returnTo} />
      <p className="font-medium">Dashboard preference</p>
      <p className="text-xs text-zinc-500">
        Last saved {preferences?.updatedAt ?? "never"} · store {storeKind}
      </p>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="hideEmpty" defaultChecked={hideEmpty} />
        Hide empty breakdown rows
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="mode"
          value="revalidate"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
        <button
          type="submit"
          name="mode"
          value="stale"
          formAction={saveProgressPreferences}
          className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
        >
          Save without revalidate
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Save writes the repo and busts the preferences cache. Save without
        revalidate writes the store but leaves GET /api/preferences stale —
        refresh to see the old pref, then Save to fix it.
      </p>
    </form>
  );
}
