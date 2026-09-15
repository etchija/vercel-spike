export type RankSnapshot = {
  currentRank: string;
  nextRank: string;
  percent: number;
};

export type VolumeSnapshot = {
  personalVolume: number;
  organizationVolume: number;
};

export type RequirementRow = {
  id: string;
  label: string;
  current: number;
  target: number;
};

export type DegradedSource = "rank" | "volume" | "requirements";

export type ProgressAggregate = {
  rank: RankSnapshot | null;
  volume: VolumeSnapshot | null;
  requirements: RequirementRow[] | null;
  degraded: DegradedSource[];
};
