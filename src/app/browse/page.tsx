import { Suspense } from "react";
import { api } from "@/lib/api";
import { BrowseClient } from "@/components/browse/BrowseClient";

export const metadata = { title: "Browse" };

export default async function BrowsePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [genresRes] = await Promise.allSettled([api.getGenres()]);
  const genres = genresRes.status === "fulfilled" ? genresRes.value.data : [];

  return (
    <div className="hcast-container py-8">
      <BrowseClient genres={genres} initialParams={sp} />
    </div>
  );
}
