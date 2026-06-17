import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(bookmarks).where(eq(bookmarks.userId, user.userId)).orderBy(bookmarks.createdAt);
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, title, coverImage } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const [existing] = await db.select().from(bookmarks)
    .where(and(eq(bookmarks.userId, user.userId), eq(bookmarks.seriesSlug, slug))).limit(1);
  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return NextResponse.json({ bookmarked: false });
  }
  await db.insert(bookmarks).values({ userId: user.userId, seriesSlug: slug, seriesTitle: title, coverImage });
  return NextResponse.json({ bookmarked: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await req.json();
  await db.delete(bookmarks).where(and(eq(bookmarks.userId, user.userId), eq(bookmarks.seriesSlug, slug)));
  return NextResponse.json({ success: true });
}
