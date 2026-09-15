import { ensurePreferencesSchema, hasDatabase, pool } from "./db";
import type { DistId, ProgressPreferences } from "./types";

const memoryStore = new Map<DistId, ProgressPreferences>();

function assertDistId(distId: DistId, forWrite: boolean): DistId | null {
  if (!distId) {
    if (forWrite) {
      throw new Error("distId is required");
    }
    return null;
  }
  if (distId === "boom") {
    throw new Error("preferences store unavailable");
  }
  return distId;
}

function fromRow(row: {
  dist_id: string;
  hide_empty_breakdown_rows: boolean;
  updated_at: Date | string;
}): ProgressPreferences {
  return {
    distId: row.dist_id,
    hideEmptyBreakdownRows: row.hide_empty_breakdown_rows,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
  };
}

async function getPreferencesFromPostgres(
  distId: DistId,
): Promise<ProgressPreferences | null> {
  if (!pool) {
    throw new Error("DATABASE_URL is not set");
  }
  await ensurePreferencesSchema();
  const result = await pool.query<{
    dist_id: string;
    hide_empty_breakdown_rows: boolean;
    updated_at: Date;
  }>(
    `
      SELECT dist_id, hide_empty_breakdown_rows, updated_at
      FROM progress_preferences
      WHERE dist_id = $1
    `,
    [distId],
  );
  const row = result.rows[0];
  return row ? fromRow(row) : null;
}

async function savePreferencesToPostgres(
  distId: DistId,
  prefs: { hideEmptyBreakdownRows: boolean },
): Promise<ProgressPreferences> {
  if (!pool) {
    throw new Error("DATABASE_URL is not set");
  }
  await ensurePreferencesSchema();
  const result = await pool.query<{
    dist_id: string;
    hide_empty_breakdown_rows: boolean;
    updated_at: Date;
  }>(
    `
      INSERT INTO progress_preferences (dist_id, hide_empty_breakdown_rows, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (dist_id)
      DO UPDATE SET
        hide_empty_breakdown_rows = EXCLUDED.hide_empty_breakdown_rows,
        updated_at = now()
      RETURNING dist_id, hide_empty_breakdown_rows, updated_at
    `,
    [distId, prefs.hideEmptyBreakdownRows],
  );
  return fromRow(result.rows[0]);
}

export async function getPreferences(
  distId: DistId,
): Promise<ProgressPreferences | null> {
  const id = assertDistId(distId, false);
  if (!id) {
    return null;
  }
  if (hasDatabase()) {
    return getPreferencesFromPostgres(id);
  }
  return memoryStore.get(id) ?? null;
}

export async function savePreferences(
  distId: DistId,
  prefs: { hideEmptyBreakdownRows: boolean },
): Promise<ProgressPreferences> {
  const id = assertDistId(distId, true);
  if (!id) {
    throw new Error("distId is required");
  }
  if (hasDatabase()) {
    return savePreferencesToPostgres(id, prefs);
  }
  const next: ProgressPreferences = {
    distId: id,
    hideEmptyBreakdownRows: prefs.hideEmptyBreakdownRows,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.set(id, next);
  return next;
}

export function preferencesStoreKind(): "postgres" | "memory" {
  return hasDatabase() ? "postgres" : "memory";
}
