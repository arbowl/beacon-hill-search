import { NextRequest, NextResponse } from "next/server";
import { getBillByBillId } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { billId } = await params;
  try {
    const bill = getBillByBillId(decodeURIComponent(billId).toUpperCase());
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    return NextResponse.json(bill, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[bill]", err);
    return NextResponse.json(
      { error: "Failed to fetch bill", detail: String(err) },
      { status: 500 }
    );
  }
}
