import { env } from "@/lib/config/env";
import { aggregateProgress, parseFailSource } from "./services";
import type { ProgressAggregate } from "./types";

export async function loadProgress(options: {
  fail?: string;
  empty?: string;
}): Promise<ProgressAggregate> {
  const fail = parseFailSource(options.fail);
  const empty = options.empty === "1";

  if (!env.backendOrigin) {
    return aggregateProgress({ fail, empty });
  }

  const url = new URL("/api/progress", env.backendOrigin);
  if (fail) url.searchParams.set("fail", fail);
  if (empty) url.searchParams.set("empty", "1");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Upstream progress failed (${res.status})`);
  }
  return (await res.json()) as ProgressAggregate;
}
