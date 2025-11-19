"use client";

import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

export default function ContinueWatching() {
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const token = localStorage.getItem('cinescope_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/user/watch-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWatchHistory(data.watchHistory || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

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
                      media_type={item.media_type || 'movie'}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
