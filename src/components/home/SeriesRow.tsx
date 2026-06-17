import { SeriesData } from "@/lib/api";
import { SeriesCard } from "@/components/series/SeriesCard";

export function SeriesRow({
  series,
  showChapters = true,
}: {
  series: SeriesData[];
  showChapters?: boolean;
}) {
  return (
    <div className="scroll-row">
      {series.map((s) => (
        <SeriesCard
          key={s.id}
          series={s}
          variant="compact"
          showChapters={showChapters}
        />
      ))}
    </div>
  );
}
