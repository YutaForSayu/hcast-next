"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Star, Eye } from "lucide-react";
import { SeriesData, formatNumber, cn } from "@/lib/api";

interface HeroBannerProps {
  banners: SeriesData[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const go = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const next = useCallback(() => go((current + 1) % banners.length), [go, current, banners.length]);
  const prev = useCallback(() => go((current - 1 + banners.length) % banners.length), [go, current, banners.length]);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  if (!banners.length) return null;

  const banner = banners[current];
  const { data, dataMetadata } = banner;

  return (
    <div className="relative w-full h-[480px] md:h-[560px] overflow-hidden bg-bg-secondary">
      {/* Background image */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      >
        {(data.backgroundImage || data.coverImage) && (
          <Image
            src={data.backgroundImage || data.coverImage!}
            alt={data.title}
            fill
            className="object-cover object-center scale-105"
            priority
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full hcast-container flex items-end pb-16">
        <div
          className={cn(
            "max-w-xl transition-all duration-500",
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          {/* Tags */}
          <div className="flex items-center gap-2 mb-3">
            {data.isHot && <span className="badge badge-hot">🔥 HOT</span>}
            <span
              className={cn(
                "badge font-mono",
                data.format === "manhwa" ? "badge-manhwa" :
                data.format === "manhua" ? "badge-manhua" : "badge-manga"
              )}
            >
              {data.format}
            </span>
            <span
              className={cn(
                "badge",
                data.status === "ongoing" ? "badge-ongoing" :
                data.status === "completed" ? "badge-completed" : "badge-hiatus"
              )}
            >
              {data.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-2">
            {data.title}
          </h1>

          {/* Author */}
          {data.author && (
            <p className="text-text-secondary text-sm mb-3 font-medium">
              by {data.author}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-text-secondary">
            {data.rating && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                {data.rating}
              </span>
            )}
            {dataMetadata?.totalViewsComputed && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {formatNumber(dataMetadata.totalViewsComputed)} views
              </span>
            )}
            {data.totalChapters && (
              <span className="flex items-center gap-1">
                <BookOpen size={14} />
                {data.totalChapters} chapters
              </span>
            )}
          </div>

          {/* Synopsis */}
          {data.synopsis && (
            <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2 max-w-md">
              {data.synopsis}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/series/${data.slug}`} className="btn-primary">
              <BookOpen size={16} />
              Read Now
            </Link>
            <Link href={`/series/${data.slug}`} className="btn-secondary">
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "w-6 h-2 bg-accent"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
