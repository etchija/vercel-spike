function read(name: string): string | undefined {
  return process.env[name];
}

export const env = {
  spikeStage: read("NEXT_PUBLIC_SPIKE_STAGE") ?? "unset",
  defaultDistId: read("SPIKE_DIST_ID") ?? "1000001",
  databaseUrl: read("DATABASE_URL"),
  backendOrigin: read("BACKEND_ORIGIN")?.replace(/\/$/, ""),
} as const;
