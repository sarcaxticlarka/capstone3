"use client";

import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TrendingSection({ type = 'all' }: { type?: string }) {
  const { data, error, isLoading } = useSWR(`/api/tmdb/trending?type=${type}`, fetcher);
  const items = data?.results?.slice(0, 12) || [];

  return (
    <section className="px-6 md:px-12 pb-24 -mt-12 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          <a href="/category?type=trending" className="text-sm text-gray-400">See all</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : items.map((m: any) => (
                <MovieCard
                  key={`${m.id}-${m.media_type || 'movie'}`}
                  id={m.id}
                  title={m.title || m.name}
                  image={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined}
                  backdrop={m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : undefined}
                  media_type={m.media_type || (m.title ? 'movie' : 'tv')}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
