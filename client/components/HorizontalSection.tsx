"use client";

import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HorizontalSectionProps {
  title: string;
  apiUrl: string;
  viewAllHref?: string;
}

export default function HorizontalSection({ title, apiUrl, viewAllHref }: HorizontalSectionProps) {
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);
  const items = data?.results?.slice(0, 12) || [];

  return (
    <section className="px-6 md:px-12 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {viewAllHref && (
            <a href={viewAllHref} className="text-sm text-gray-400 hover:text-white">
              See all →
            </a>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="min-w-[150px] md:min-w-[180px] snap-start">
                    <MovieCardSkeleton />
                  </div>
                ))
              : items.map((m: any) => (
                  <div key={`${m.id}-${m.media_type || 'movie'}`} className="min-w-[150px] md:min-w-[180px] snap-start">
                    <MovieCard
                      id={m.id}
                      title={m.title || m.name}
                      image={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined}
                      backdrop={m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : undefined}
                      media_type={m.media_type || (m.title ? 'movie' : 'tv')}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
