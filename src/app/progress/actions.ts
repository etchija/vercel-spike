"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { savePreferences } from "@/lib/progress/preferences-repo";

export async function saveProgressPreferences(formData: FormData) {
  const distId = String(formData.get("distId") ?? "");
  const hideEmptyBreakdownRows = formData.get("hideEmpty") === "on";
  const mode = String(formData.get("mode") ?? "revalidate");

  await savePreferences(distId, { hideEmptyBreakdownRows });

  if (mode !== "stale") {
    revalidateTag("preferences");
    revalidatePath("/progress");
  }
}
