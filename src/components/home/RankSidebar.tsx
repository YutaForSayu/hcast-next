import Link from "next/link";
import Image from "next/image";
import { Trophy, Star } from "lucide-react";
import { api, formatNumber } from "@/lib/api";

export async function RankSidebar() {
  const [manhwaRes, manhuaRes, mangaRes] = await Promise.allSettled([
    api.getTopManhwa(5),
    api.getTopManhua(5),
    api.getTopManga(5),
  ]);

  const manhwa = manhwaRes.status === "fulfilled" ? manhwaRes.value.data : [];
  const manhua = manhuaRes.status === "fulfilled" ? manhuaRes.value.data : [];
  const manga = mangaRes.status === "fulfilled" ? mangaRes.value.data : [];

  return (
    <div className="space-y-6">
      <RankList title="Top Manhwa" items={manhwa} color="purple" />
      <RankList title="Top Manhua" items={manhua} color="blue" />
      <RankList title="Top Manga" items={manga} color="orange" />
    </div>
  );
}

function RankList({ title, items, color }: {
  title: string;
  items: any[];
  color: "purple" | "blue" | "orange";
}) {
  const colorMap = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Trophy size={15} className={colorMap[color]} />
        <h3 className="text-sm font-bold text-text-primary font-display">{title}</h3>
      </div>
      <div className="divide-y divide-border/50">
        {items.slice(0, 5).map((s, i) => (
          <Link key={s.id} href={`/series/${s.data.slug}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-elevated transition-colors group">
            <span className={`text-xl font-display font-black w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-text-dim"}`}>
              {i + 1}
            </span>
            <div className="relative w-9 h-12 rounded overflow-hidden flex-shrink-0">
              {s.data.coverImage && (
                <Image src={s.data.coverImage} alt={s.data.title} fill className="object-cover" unoptimized />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary group-hover:text-accent transition-colors truncate">{s.data.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="text-yellow-400" fill="currentColor" />
                <span className="text-[10px] text-text-muted">{s.data.rating}</span>
                {s.dataMetadata?.totalViewsComputed && (
                  <span className="text-[10px] text-text-dim ml-1">{formatNumber(s.dataMetadata.totalViewsComputed)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
