import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

/** Parse a chapter query param as float. Returns null for series-level. */
function parseChapter(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

/** Drizzle WHERE clause fragment for matching a real-typed chapterIndex */
function chapterWhere(chIdx: number | null) {
  if (chIdx === null) return isNull(comments.chapterIndex);
  // Cast both sides to numeric to avoid float4 precision mismatch in Postgres
  return sql`${comments.chapterIndex}::numeric = ${chIdx}::numeric`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const chIdx = parseChapter(searchParams.get("chapter"));

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      isEdited: comments.isEdited,
      createdAt: comments.createdAt,
      userId: comments.userId,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.seriesSlug, slug), chapterWhere(chIdx)))
    .orderBy(desc(comments.createdAt))
    .limit(100);

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, content, chapterIndex, parentId } = await req.json();
  if (!slug || !content?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Accept float chapter index from client (e.g. 29.1, 1.2)
  const chIdx =
    chapterIndex !== undefined && chapterIndex !== null
      ? parseFloat(String(chapterIndex))
      : null;

  const [comment] = await db
    .insert(comments)
    .values({
      userId: user.userId,
      seriesSlug: slug,
      content: content.trim(),
      chapterIndex: chIdx !== null && !isNaN(chIdx) ? chIdx : null,
      parentId: parentId ?? null,
    })
    .returning();

  return NextResponse.json({ data: { ...comment, username: user.username } });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const [existing] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);
  if (!existing || existing.userId !== user.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(comments).where(eq(comments.id, id));
  return NextResponse.json({ success: true });
}
