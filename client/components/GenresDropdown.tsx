"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GenresDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data } = useSWR('/api/tmdb/genres?type=movie', fetcher);
  const genres = data?.genres || [];

  const handleGenreClick = (genreId: number, genreName: string) => {
    setIsOpen(false);
    router.push(`/category?genre=${genreId}&name=${encodeURIComponent(genreName)}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-100 hover:text-gray-300 cursor-pointer flex items-center gap-1"
      >
        Genres
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-xl rounded-xl p-4 w-64 max-h-96 overflow-auto z-20 ring-1 text-white ring-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre: any) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id, genre.name)}
                  className="text-left px-3 py-2 text-sm hover:bg-white/10 rounded transition"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
