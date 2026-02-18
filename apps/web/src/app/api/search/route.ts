import { NextRequest, NextResponse } from "next/server";
import { searchBills } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const committeeId = searchParams.get("committee") ?? undefined;
  const session = searchParams.get("session") ?? undefined;
  const computedState = searchParams.get("state") ?? undefined;

  try {
    const results = searchBills({ q, page, committeeId, session, computedState });
    return NextResponse.json(results, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json(
      { error: "Search failed", detail: String(err) },
      { status: 500 }
    );
  }
}
