import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { savePreferences } from "@/lib/progress/preferences-repo";
import { loadCachedPreferences } from "@/lib/progress/load-preferences";

export const revalidate = 60;

export async function GET(request: Request) {
  const distId = new URL(request.url).searchParams.get("distId") ?? "";
  const prefs = await loadCachedPreferences(distId);
  return Response.json(prefs);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let distId = "";
  let hideEmptyBreakdownRows = false;
  let returnTo: string | undefined;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      distId?: string;
      hideEmptyBreakdownRows?: boolean;
    };
    distId = String(body.distId ?? "");
    hideEmptyBreakdownRows = Boolean(body.hideEmptyBreakdownRows);
  } else {
    const form = await request.formData();
    distId = String(form.get("distId") ?? "");
    hideEmptyBreakdownRows = form.get("hideEmpty") === "on";
    const next = String(form.get("next") ?? "/progress");
    returnTo = next.startsWith("/progress") ? next : "/progress";
  }

  const prefs = await savePreferences(distId, { hideEmptyBreakdownRows });
  revalidateTag("preferences");
  revalidatePath("/progress");

  if (returnTo) {
    redirect(returnTo);
  }

  return Response.json(prefs);
}
