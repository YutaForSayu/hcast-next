import { notFound } from "next/navigation";
import { api, getProxiedImage } from "@/lib/api";
import { ChapterReader } from "@/components/chapter/ChapterReader";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter } = await params;
  return { title: `Chapter ${chapter}` };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;

  // Use parseFloat to support decimal chapters like "29.1", "12.5", "0.5"
  const chapterIndex = parseFloat(chapter);
  if (isNaN(chapterIndex)) notFound();

  const [chapterRes, chaptersRes, detailRes] = await Promise.allSettled([
    api.getChapterDetail(slug, chapterIndex),
    api.getSeriesChapters(slug),
    api.getSeriesDetail(slug),
  ]);

  if (chapterRes.status === "rejected") notFound();

  const chapterData = chapterRes.value.data;
  const allChapters = chaptersRes.status === "fulfilled" ? chaptersRes.value.data : [];
  const detail = detailRes.status === "fulfilled" ? detailRes.value.data : null;

  const proxiedImages = (chapterData.data.images || []).map((url: string) =>
    getProxiedImage(url, slug, chapterIndex)
  );

  const sorted = [...allChapters].sort((a, b) => a.data.index - b.data.index);

  // Use epsilon comparison for float indexes (e.g. 29.1 vs 29.10000000000001)
  const currentIdx = sorted.findIndex(
    (c) => Math.abs(c.data.index - chapterIndex) < 0.001
  );
  const prevChapter =
    currentIdx > 0 ? sorted[currentIdx - 1].data.index : null;
  const nextChapter =
    currentIdx < sorted.length - 1 ? sorted[currentIdx + 1].data.index : null;

  return (
    <ChapterReader
      slug={slug}
      chapterIndex={chapterIndex}
      chapterLabel={chapter}         // original string e.g. "29.1"
      seriesTitle={detail?.data.title ?? slug}
      coverImage={detail?.data.coverImage}
      images={proxiedImages}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      allChapters={allChapters}
    />
  );
}
