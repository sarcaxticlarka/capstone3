"use client";

import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import { fetchWatchHistory } from '../lib/userLists';
import { useToasts } from './ToastProvider';

export default function ContinueWatching() {
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { push } = useToasts();

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('cinescope_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const history = await fetchWatchHistory(token);
        setWatchHistory(history);
      } catch (e) {
        console.error(e);
        push('Failed to load watch history', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [push]);

  // Don't show section if not logged in or no history
  if (!loading && watchHistory.length === 0) return null;

  return (
    <section className="px-6 md:px-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
          <a href="/profile" className="text-sm text-gray-400 hover:text-white transition">
            See all
          </a>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : watchHistory.slice(0, 12).map((item: any) => (
                  <div key={item.tmdbId} className="flex-shrink-0 w-40 sm:w-48">
                    <MovieCard
                      id={item.tmdbId}
                      title={item.title}
                      image={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined}
                      backdrop={item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined}
                      media_type={item.media_type || (item.title ? 'movie' : 'tv')}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
