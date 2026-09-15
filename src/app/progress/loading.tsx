export default function ProgressLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
