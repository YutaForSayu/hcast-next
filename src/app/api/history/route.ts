import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readHistory } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, and, desc, sql } from "drizzle-orm";

function chapterEq(chIdx: number) {
  return sql`${readHistory.chapterIndex}::numeric = ${chIdx}::numeric`;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(readHistory)
    .where(eq(readHistory.userId, user.userId))
    .orderBy(desc(readHistory.readAt))
    .limit(100);

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { seriesSlug, chapterIndex } = await req.json();
  if (!seriesSlug || chapterIndex === undefined)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const chIdx = parseFloat(String(chapterIndex));
  if (isNaN(chIdx))
    return NextResponse.json({ error: "Invalid chapterIndex" }, { status: 400 });

  // Upsert: remove existing, insert fresh
  await db
    .delete(readHistory)
    .where(
      and(
        eq(readHistory.userId, user.userId),
        eq(readHistory.seriesSlug, seriesSlug),
        chapterEq(chIdx)
      )
    );

  const [entry] = await db
    .insert(readHistory)
    .values({ userId: user.userId, seriesSlug, chapterIndex: chIdx })
    .returning();

  return NextResponse.json({ data: entry });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { seriesSlug, chapterIndex } = await req.json();

  if (seriesSlug === "all") {
    await db.delete(readHistory).where(eq(readHistory.userId, user.userId));
  } else {
    const chIdx =
      chapterIndex !== undefined ? parseFloat(String(chapterIndex)) : null;
    await db.delete(readHistory).where(
      and(
        eq(readHistory.userId, user.userId),
        eq(readHistory.seriesSlug, seriesSlug),
        ...(chIdx !== null && !isNaN(chIdx) ? [chapterEq(chIdx)] : [])
      )
    );
  }

  return NextResponse.json({ success: true });
}
