import { Suspense } from "react";
import { Flame, TrendingUp, Clock, Star, BarChart2 } from "lucide-react";
import { api } from "@/lib/api";
import { HeroBanner } from "@/components/home/HeroBanner";
import { SeriesCard, SeriesCardSkeleton } from "@/components/series/SeriesCard";
import { LatestUpdates } from "@/components/home/LatestUpdates";
import { SeriesRow } from "@/components/home/SeriesRow";
import { RankSidebar } from "@/components/home/RankSidebar";

export default async function HomePage() {
  const [bannersRes, trendingRes, popularRes, latestRes] = await Promise.allSettled([
    api.getBanners(),
    api.getTrending(8),
    api.getPopular(12),
    api.getLatest(1, 20),
  ]);

  const banners = bannersRes.status === "fulfilled" ? bannersRes.value.data.slice(0, 9) : [];
  const trending = trendingRes.status === "fulfilled" ? trendingRes.value.data : [];
  const popular = popularRes.status === "fulfilled" ? popularRes.value.data : [];
  const latest = latestRes.status === "fulfilled" ? latestRes.value.data : [];

  return (
    <div className="pt-16">
      {/* Hero Banner */}
      {banners.length > 0 && <HeroBanner banners={banners} />}

      <div className="hcast-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Main content */}
          <div className="space-y-10">
            {/* Trending This Month */}
            {trending.length > 0 && (
              <section>
                <div className="section-title">
                  <Flame size={18} className="text-accent" />
                  Trending This Month
                </div>
                <SeriesRow series={trending} />
              </section>
            )}

            {/* Most Popular */}
            {popular.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="section-title mb-0">
                    <TrendingUp size={18} className="text-blue-400" />
                    Most Popular
                  </div>
                  <a href="/browse?sort=popularity" className="text-xs text-text-muted hover:text-accent transition-colors">
                    See all →
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                  {popular.slice(0, 12).map((s) => (
                    <SeriesCard key={s.id} series={s} variant="default" showChapters={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Updates */}
            {latest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="section-title mb-0">
                    <Clock size={18} className="text-emerald-400" />
                    Latest Updates
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <a href="/browse" className="hover:text-accent transition-colors">All</a>
                    <span>·</span>
                    <a href="/browse?type=project" className="hover:text-accent transition-colors">HCast</a>
                    <span>·</span>
                    <a href="/browse?type=mirror" className="hover:text-accent transition-colors">Mirror</a>
                  </div>
                </div>
                <LatestUpdates series={latest} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
              <RankSidebar />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}
