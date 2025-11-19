"use client";

import React from 'react';
import Link from 'next/link';

export default function MovieCard({
  id,
  title,
  image,
  media_type,
  backdrop,
}: {
  id: number | string;
  title: string;
  image?: string;
  media_type?: string;
  backdrop?: string;
}) {
  const playHref = `/player/${media_type || 'movie'}/${id}`;
  const detailHref = media_type === 'tv' ? `/tv/${id}` : `/movie/${id}`;

  return (
    <div className="group relative rounded-lg overflow-hidden bg-gray-800">
      <Link href={detailHref} aria-label={title}>
        <img src={image || backdrop} alt={title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
      </Link>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
        <div className="p-3 w-full">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <a href={playHref} className="px-3 py-1 bg-white text-black text-xs rounded">Watch</a>
            <Link href={detailHref} className="px-3 py-1 bg-white/10 text-white text-xs rounded border border-white/10">Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
