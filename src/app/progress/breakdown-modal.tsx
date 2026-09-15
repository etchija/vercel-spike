"use client";

import { useRef } from "react";
import type { RequirementRow } from "@/lib/progress/types";

function isEmptyRow(row: RequirementRow): boolean {
  return row.current <= 0;
}

export function BreakdownModal({
  hideEmpty,
  requirements,
  requirementsDegraded,
}: {
  hideEmpty: boolean;
  requirements: RequirementRow[] | null;
  requirementsDegraded: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visibleRows = (requirements ?? []).filter(
    (row) => !hideEmpty || !isEmptyRow(row),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Open breakdown
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold">Progress breakdown</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Empty rows {hideEmpty ? "hidden" : "visible"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {requirementsDegraded ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              Requirements service failed. Other progress data is still shown.
            </p>
          ) : visibleRows.length === 0 ? (
            <p className="text-sm text-zinc-500">No breakdown rows to show.</p>
          ) : (
            <ul className="space-y-3">
              {visibleRows.map((row) => {
                const percent = Math.min(
                  100,
                  Math.round((row.current / row.target) * 100),
                );
                return (
                  <li key={row.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="tabular-nums text-zinc-500">
                        {row.current} / {row.target}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

        </div>
      </dialog>
    </>
  );
}
