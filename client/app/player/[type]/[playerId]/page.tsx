"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PlayerPage() {
  const params = useParams();
  const type = params?.type as string;
  const playerId = params?.playerId as string;

  useEffect(() => {
    // Track watch history
    async function trackWatch() {
      const token = localStorage.getItem('cinescope_token');
      if (!token || !playerId || !type) return;

      try {
        // Fetch movie/TV details first
        const detailRes = await fetch(`/api/tmdb/${type}/${playerId}`);
        const details = await detailRes.json();
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/user/watch-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tmdbId: parseInt(playerId),
            media_type: type,
            title: details.title || details.name,
            poster_path: details.poster_path,
            backdrop_path: details.backdrop_path,
          }),
        });
      } catch (e) {
        console.error('Failed to track watch history:', e);
      }
    }

    trackWatch();
  }, [playerId, type]);

  if (!playerId || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="p-6">Invalid video link.</div>
      </div>
    );
  }

  const actualType = !type || type === 'undefined' ? 'tv' : type;
  const embedURL = `https://vidsrc.xyz/embed/${actualType}/${playerId}`;

  return (
    <div className="w-full h-screen flex justify-center items-center bg-black fixed top-0 left-0 z-50">
      <iframe
        className="w-full h-screen"
        title="Video Player"
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        src={embedURL}
      ></iframe>
    </div>
  );
}
