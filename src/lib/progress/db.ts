import { Pool } from "pg";
import { env } from "@/lib/config/env";

export function hasDatabase(): boolean {
  return Boolean(env.databaseUrl);
}

export const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      max: 4,
      idleTimeoutMillis: 10_000,
      ssl: { rejectUnauthorized: false },
    })
  : null;

let schemaReady: Promise<void> | null = null;

export async function ensurePreferencesSchema(): Promise<void> {
  if (!pool) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `
          CREATE TABLE IF NOT EXISTS progress_preferences (
            dist_id TEXT PRIMARY KEY,
            hide_empty_breakdown_rows BOOLEAN NOT NULL DEFAULT false,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )
        `,
      )
      .then(() => undefined);
  }
  await schemaReady;
}
