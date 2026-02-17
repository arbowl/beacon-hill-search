import { NextResponse } from "next/server";
import { getStats } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
