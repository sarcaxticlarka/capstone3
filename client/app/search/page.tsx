"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import MovieCard from '../../components/MovieCard';
import MovieCardSkeleton from '../../components/MovieCardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState<any[]>([]);
  const { ref, inView } = useInView();

  const { data, error, isLoading } = useSWR(
    initial ? `/api/tmdb/search?q=${encodeURIComponent(initial)}&page=${page}` : null,
    fetcher
  );

  useEffect(() => {
    setAllResults([]);
    setPage(1);
  }, [initial]);

  useEffect(() => {
    if (data?.results) {
      setAllResults((prev) => {
        const newItems = data.results.filter((item: any) => !prev.some((p: any) => p.id === item.id));
        return page === 1 ? data.results : [...prev, ...newItems];
      });
    }
  }, [data, page]);

  useEffect(() => {
    if (inView && !isLoading && data?.page < data?.total_pages) {
      setPage((p) => p + 1);
    }
  }, [inView, isLoading, data]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(`/search?q=${encodeURIComponent(query)}`);
   
  };

  return (
    <main className="pt-28 px-4 md:px-12">
      


      <section className="mt-10">
        <h2 className="text-xl text-gray-300 mb-4">Results {initial ? `for "${initial}"` : ''}</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {allResults.map((item: any) =>
            item.poster_path ? (
              <MovieCard
                key={item.id}
                id={item.id}
                title={item.title || item.name}
                image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                media_type={item.media_type || (item.title ? 'movie' : 'tv')}
              />
            ) : null
          )}

          {isLoading &&
            Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={`skeleton-${i}`} />)}
        </div>

        {/* Infinite scroll trigger */}
        {!isLoading && data?.page < data?.total_pages && (
          <div ref={ref} className="py-8 text-center text-gray-400">
            Loading more...
          </div>
        )}

        {allResults.length === 0 && !isLoading && initial && (
          <div className="text-gray-500 bg-gray-900 rounded-lg p-8 text-center">
            No results found for "{initial}"
          </div>
        )}
      </section>

      <section className="mt-16 mb-24">
        <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400">
            Search supports movies and TV shows. Use filters for more precise results.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      <Suspense fallback={
        <main className="pt-28 px-4 md:px-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Search</h1>
          <div className="text-gray-400">Loading...</div>
        </main>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
