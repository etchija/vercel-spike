import type {
  DegradedSource,
  ProgressAggregate,
  RankSnapshot,
  RequirementRow,
  VolumeSnapshot,
} from "./types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withLatency<T>(ms: number, run: () => Promise<T>): Promise<T> {
  await delay(ms);
  return run();
}

export function parseFailSource(
  value: string | undefined,
): DegradedSource | undefined {
  if (value === "rank" || value === "volume" || value === "requirements") {
    return value;
  }
  return undefined;
}

async function fetchRank(): Promise<RankSnapshot> {
  return {
    currentRank: "Silver",
    nextRank: "Gold",
    percent: 72,
  };
}

async function fetchVolume(): Promise<VolumeSnapshot> {
  return {
    personalVolume: 180,
    organizationVolume: 4200,
  };
}

async function fetchRequirements(empty: boolean): Promise<RequirementRow[]> {
  if (empty) {
    return [
      { id: "pv", label: "Personal volume", current: 0, target: 100 },
      { id: "leg", label: "Active frontline legs", current: 0, target: 2 },
      { id: "ov", label: "Organization volume", current: 0, target: 5000 },
    ];
  }
  return [
    { id: "pv", label: "Personal volume", current: 180, target: 100 },
    { id: "leg", label: "Active frontline legs", current: 0, target: 2 },
    { id: "ov", label: "Organization volume", current: 4200, target: 5000 },
  ];
}

export async function aggregateProgress(options: {
  fail?: DegradedSource;
  empty?: boolean;
}): Promise<ProgressAggregate> {
  const { fail, empty = false } = options;

  const [rankResult, volumeResult, requirementsResult] = await Promise.allSettled([
    withLatency(80, () =>
      fail === "rank"
        ? Promise.reject(new Error("rank service unavailable"))
        : fetchRank(),
    ),
    withLatency(250, () =>
      fail === "volume"
        ? Promise.reject(new Error("volume service unavailable"))
        : fetchVolume(),
    ),
    withLatency(400, () =>
      fail === "requirements"
        ? Promise.reject(new Error("requirements service unavailable"))
        : fetchRequirements(empty),
    ),
  ]);

  const degraded: DegradedSource[] = [];
  if (rankResult.status === "rejected") degraded.push("rank");
  if (volumeResult.status === "rejected") degraded.push("volume");
  if (requirementsResult.status === "rejected") degraded.push("requirements");

  return {
    rank: rankResult.status === "fulfilled" ? rankResult.value : null,
    volume: volumeResult.status === "fulfilled" ? volumeResult.value : null,
    requirements:
      requirementsResult.status === "fulfilled"
        ? requirementsResult.value
        : null,
    degraded,
  };
}
