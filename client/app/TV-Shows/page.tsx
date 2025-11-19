"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { useInView } from 'react-intersection-observer';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import MovieCard from '../../components/MovieCard';
import MovieCardSkeleton from '../../components/MovieCardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TVShowsPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/api/tmdb/discover?type=tv&sort_by=popularity.desc&vote_count.gte=100&page=${page}`,
    fetcher
  );

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const [allResults, setAllResults] = useState<any[]>([]);

  // Append results when new page data arrives
  if (data?.results && !isLoading) {
    const newIds = data.results.map((r: any) => r.id);
    const existingIds = allResults.map((r) => r.id);
    const hasNew = newIds.some((id: any) => !existingIds.includes(id));
    if (hasNew) {
      setAllResults((prev) => {
        const combined = [...prev, ...data.results];
        // Remove duplicates
        return combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
      });
    }
  }

  // Load more when scrolled into view
  if (inView && data?.page < data?.total_pages && !isLoading) {
    setPage((p) => p + 1);
  }

  return (
    <div className="bg-black min-h-screen">
      <Nav />
      <div className="pt-24 px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">TV Shows</h1>
          <p className="text-gray-400 mb-8">Explore popular TV series and shows</p>

          {/* TV Shows Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allResults.map((show: any) => (
              <MovieCard
                key={show.id}
                id={show.id}
                title={show.title || show.name}
                image={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined}
                backdrop={show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : undefined}
                media_type="tv"
              />
            ))}

            {/* Loading Skeletons */}
            {isLoading &&
              Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={`skeleton-${i}`} />)}
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load TV shows. Please try again.</p>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="h-20 flex items-center justify-center">
            {isLoading && <p className="text-gray-400">Loading more...</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
