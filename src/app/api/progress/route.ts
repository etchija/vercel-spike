import { aggregateProgress, parseFailSource } from "@/lib/progress/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await aggregateProgress({
    fail: parseFailSource(searchParams.get("fail") ?? undefined),
    empty: searchParams.get("empty") === "1",
  });
  return Response.json(data);
}
