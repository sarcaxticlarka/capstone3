"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import SafeNav from '../../components/SafeNav';
import Footer from '../../components/Footer';
import MovieCard from '../../components/MovieCard';
import MovieCardSkeleton from '../../components/MovieCardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CategoryContent() {
  const searchParams = useSearchParams();
  const genre = searchParams.get('genre') || '';
  const name = searchParams.get('name') || 'Category';
  const type = searchParams.get('type') || 'movie';
  const region = searchParams.get('region') || '';
  const lang = searchParams.get('lang') || '';

  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const { ref, inView } = useInView();

  let apiUrl = '';
  
  if (type === 'trending') {
    apiUrl = `/api/tmdb/trending?type=all&page=${page}`;
  } else if (type === 'new-releases') {
    apiUrl = `/api/tmdb/discover?type=movie&sort_by=primary_release_date.desc&vote_count.gte=100&page=${page}`;
  } else if (type === 'new-series') {
    apiUrl = `/api/tmdb/discover?type=tv&sort_by=first_air_date.desc&vote_count.gte=50&page=${page}`;
  } else if (type === 'blockbusters') {
    apiUrl = `/api/tmdb/discover?type=movie&sort_by=popularity.desc&vote_count.gte=1000&page=${page}`;
  } else {
    apiUrl = `/api/tmdb/discover?type=${type}&page=${page}`;
    if (genre) apiUrl += `&genre=${genre}`;
    if (region) apiUrl += `&region=${region}`;
    if (lang) apiUrl += `&with_original_language=${lang}`;
  }

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    setAllItems([]);
    setPage(1);
  }, [genre, type, region, lang, name]);

  useEffect(() => {
    if (data?.results) {
      setAllItems((prev) => {
        const newItems = data.results.filter((item: any) => !prev.some((p) => p.id === item.id));
        return [...prev, ...newItems];
      });
    }
  }, [data]);

  useEffect(() => {
    if (inView && !isLoading && data?.page < data?.total_pages) {
      setPage((p) => p + 1);
    }
  }, [inView, isLoading, data]);

  return (
    <div className="min-h-screen bg-black text-white">
      <SafeNav />
      <main className="pt-28 px-4 md:px-12 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{name}</h1>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load content. Please try again.</p>
          </div>
        )}

        {!error && allItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">No items found.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allItems.map((m: any) => (
            <MovieCard
              key={`${m.id}-${m.media_type || type}`}
              id={m.id}
              title={m.title || m.name}
              image={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined}
              backdrop={m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : undefined}
              media_type={m.media_type || type}
            />
          ))}

          {isLoading &&
            Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={`skeleton-${i}`} />)}
        </div>

        {!isLoading && data?.page < data?.total_pages && (
          <div ref={ref} className="py-8 text-center text-gray-400">
            Loading more...
          </div>
        )}

        {allItems.length > 0 && data?.page >= data?.total_pages && (
          <div className="py-8 text-center text-gray-500">No more items</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
