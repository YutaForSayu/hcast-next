import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seriesReactions } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

/** -1 sentinel = series-level reaction (no chapter) */
const SERIES_SENTINEL = -1;

function parseChapter(raw: string | null | undefined): number {
  if (raw === null || raw === undefined || raw === "") return SERIES_SENTINEL;
  const n = parseFloat(raw);
  return isNaN(n) ? SERIES_SENTINEL : n;
}

/** Numeric cast comparison to avoid float4 precision drift in Postgres */
function chapterEq(chIdx: number) {
  return sql`${seriesReactions.chapterIndex}::numeric = ${chIdx}::numeric`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const chIdx = parseChapter(searchParams.get("chapter"));

  const rows = await db
    .select({ type: seriesReactions.type, count: sql<number>`count(*)::int` })
    .from(seriesReactions)
    .where(and(eq(seriesReactions.seriesSlug, slug), chapterEq(chIdx)))
    .groupBy(seriesReactions.type);

  const user = await getAuthUser();
  let userReaction = null;
  if (user) {
    const [ur] = await db
      .select({ type: seriesReactions.type })
      .from(seriesReactions)
      .where(
        and(
          eq(seriesReactions.seriesSlug, slug),
          eq(seriesReactions.userId, user.userId),
          chapterEq(chIdx)
        )
      )
      .limit(1);
    userReaction = ur?.type ?? null;
  }

  const totals: Record<string, number> = { like: 0, funny: 0, nice: 0, sad: 0, angry: 0, fire: 0, mykisah: 0, gokil: 0, love: 0, moai: 0 };
  for (const r of rows) totals[r.type] = r.count;

  return NextResponse.json({ data: { totals, userReaction } });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, type, chapterIndex } = await req.json();

  // Accept float from client; undefined/null → series-level sentinel
  const chIdx =
    chapterIndex !== undefined && chapterIndex !== null
      ? parseFloat(String(chapterIndex))
      : SERIES_SENTINEL;

  // Remove existing reaction for this slug+user+chapter
  await db
    .delete(seriesReactions)
    .where(
      and(
        eq(seriesReactions.seriesSlug, slug),
        eq(seriesReactions.userId, user.userId),
        chapterEq(isNaN(chIdx) ? SERIES_SENTINEL : chIdx)
      )
    );

  // Insert new reaction (if type provided — null means "remove only")
  if (type) {
    await db.insert(seriesReactions).values({
      seriesSlug: slug,
      userId: user.userId,
      type,
      chapterIndex: isNaN(chIdx) ? SERIES_SENTINEL : chIdx,
    });
  }

  return NextResponse.json({ success: true });
}
