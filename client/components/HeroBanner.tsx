"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HeroBanner({ type = 'all' }: { type?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/tmdb/trending?type=${type}`, fetcher);
  
  const movies = data?.results?.filter((m: any) => m.backdrop_path && (m.title || m.name)) || [];

  useEffect(() => {
    if (movies.length === 0) return;
    const id = setInterval(() => setCurrentIndex((p) => (p + 1) % movies.length), 5000);
    return () => clearInterval(id);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  return (
    <div className="relative w-full h-[75vh] overflow-hidden rounded-xl mt-20 mb-10">
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        alt={movie.title || movie.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
      />

      <div className="absolute inset-0 bg-black/45"></div>

      <div className="relative flex flex-col justify-end h-full pb-16 max-w-6xl mx-auto text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title || movie.name}</h1>
        <div className="flex items-center text-sm opacity-80 space-x-4 mb-4">
          <span>{(movie.release_date || movie.first_air_date || '').slice(0, 4)}</span>
          <span>|</span>
          <span>{Math.floor(Math.random() * 80) + 80} min</span>
        </div>
        <p className="text-gray-300 max-w-xl line-clamp-3 mb-6">{movie.overview}</p>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
              router.push(`/player/${mediaType}/${movie.id}`);
            }}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Watch Now
          </button>
          <button
            onClick={() => {
              const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
              router.push(`/${mediaType}/${movie.id}`);
            }}
            className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition border border-white/30"
          >
            More Info
          </button>
        </div>
      </div>

      <button
        onClick={() => setCurrentIndex((p) => (p === 0 ? movies.length - 1 : p - 1))}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 hover:bg-black/70 p-3 rounded-full text-white transition z-10"
        aria-label="Previous"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentIndex((p) => (p + 1) % movies.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full text-white hover:bg-black/70 transition z-10"
        aria-label="Next"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
