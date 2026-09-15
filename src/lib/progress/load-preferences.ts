import { unstable_cache } from "next/cache";
import { getPreferences } from "./preferences-repo";

export const loadCachedPreferences = unstable_cache(
  async (distId: string) => getPreferences(distId),
  ["progress-preferences"],
  { tags: ["preferences"], revalidate: 60 },
);
