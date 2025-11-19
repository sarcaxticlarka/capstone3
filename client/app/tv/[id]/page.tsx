"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SafeNav from '../../../components/SafeNav';
import Footer from '../../../components/Footer';

export const dynamic = 'force-dynamic';

export default function TVPage() {
  const params = useParams();
  const id = params?.id as string;
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/tv/${id}`);
        const data = await res.json();
        if (!mounted) return;
        setShow(data);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) return;
    async function checkLists() {
      try {
        const [fRes, wRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/watchlist`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const fjson = await fRes.json();
        const wjson = await wRes.json();
        const favs = fjson.favorites || [];
        const watch = wjson.watchlist || [];
        setInFavorites(favs.some((f: any) => f.tmdbId === Number(id)));
        setInWatchlist(watch.some((f: any) => f.tmdbId === Number(id)));
      } catch (e) {}
    }
    checkLists();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black">
      <SafeNav />
      <div className="pt-24 px-6 text-white text-center">Loading...</div>
      <Footer />
    </div>
  );
  
  if (!show || show.status_code === 34) return (
    <div className="min-h-screen bg-black">
      <SafeNav />
      <div className="pt-24 px-6 text-white text-center">TV show not found.</div>
      <Footer />
    </div>
  );

  const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  async function handleAddFavorite() {
    if (!token) return router.push('/login');
    setFavLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tmdbId: Number(id), media_type: 'tv', title: show.name, poster_path: show.poster_path, backdrop_path: show.backdrop_path }),
      });
      if (res.ok) setInFavorites(true);
    } catch (e) {}
    setFavLoading(false);
  }

  async function handleRemoveFavorite() {
    if (!token) return router.push('/login');
    setFavLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/favorites/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setInFavorites(false);
    } catch (e) {}
    setFavLoading(false);
  }

  async function handleAddWatchlist() {
    if (!token) return router.push('/login');
    setFavLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tmdbId: Number(id), media_type: 'tv', title: show.name, poster_path: show.poster_path, backdrop_path: show.backdrop_path }),
      });
      if (res.ok) setInWatchlist(true);
    } catch (e) {}
    setFavLoading(false);
  }

  async function handleRemoveWatchlist() {
    if (!token) return router.push('/login');
    setFavLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/user/watchlist/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setInWatchlist(false);
    } catch (e) {}
    setFavLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SafeNav />
      <div className="pt-24 px-6 md:px-12 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Backdrop Image */}
          {show.backdrop_path && (
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
              <img 
                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`} 
                alt={show.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              {show.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                  alt={show.name} 
                  className="rounded-lg w-full shadow-2xl" 
                />
              ) : (
                <div className="bg-gray-800 rounded-lg w-full h-96 flex items-center justify-center">
                  <span className="text-gray-500">No poster</span>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{show.name}</h1>
              
              <div className="flex items-center gap-4 text-gray-400 mb-6">
                {show.first_air_date && <span>{new Date(show.first_air_date).getFullYear()}</span>}
                {show.number_of_seasons && (
                  <span>· {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                )}
                {show.vote_average && (
                  <span className="flex items-center gap-1">
                    · ⭐ {show.vote_average.toFixed(1)}/10
                  </span>
                )}
                {show.status && <span>· {show.status}</span>}
              </div>

              {show.genres && show.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {show.genres.map((g: any) => (
                    <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 text-lg mb-8 leading-relaxed">{show.overview}</p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a 
                  href={`/player/tv/${id}`}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                  Watch Now
                </a>

                {inFavorites ? (
                  <button 
                    onClick={handleRemoveFavorite} 
                    disabled={favLoading} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded transition"
                  >
                    {favLoading ? 'Working...' : '❤️ Remove Favorite'}
                  </button>
                ) : (
                  <button 
                    onClick={handleAddFavorite} 
                    disabled={favLoading} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded transition"
                  >
                    {favLoading ? 'Working...' : '🤍 Add to Favorites'}
                  </button>
                )}

                {inWatchlist ? (
                  <button 
                    onClick={handleRemoveWatchlist} 
                    disabled={favLoading} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded transition"
                  >
                    {favLoading ? 'Working...' : '✓ In Watchlist'}
                  </button>
                ) : (
                  <button 
                    onClick={handleAddWatchlist} 
                    disabled={favLoading} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded transition"
                  >
                    {favLoading ? 'Working...' : '+ Add to Watchlist'}
                  </button>
                )}
              </div>

              {/* Seasons */}
              {show.seasons && show.seasons.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {show.seasons.map((season: any) => (
                      <div key={season.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                        <div className="font-semibold mb-1">{season.name}</div>
                        <div className="text-sm text-gray-400">
                          {season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
                        </div>
                        {season.air_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(season.air_date).getFullYear()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-3 text-sm">
                {show.created_by && show.created_by.length > 0 && (
                  <div>
                    <span className="text-gray-500">Created by: </span>
                    <span className="text-gray-300">
                      {show.created_by.map((c: any) => c.name).join(', ')}
                    </span>
                  </div>
                )}
                
                {show.networks && show.networks.length > 0 && (
                  <div>
                    <span className="text-gray-500">Network: </span>
                    <span className="text-gray-300">
                      {show.networks.map((n: any) => n.name).join(', ')}
                    </span>
                  </div>
                )}

                {show.spoken_languages && show.spoken_languages.length > 0 && (
                  <div>
                    <span className="text-gray-500">Languages: </span>
                    <span className="text-gray-300">
                      {show.spoken_languages.map((l: any) => l.english_name).join(', ')}
                    </span>
                  </div>
                )}

                {show.production_companies && show.production_companies.length > 0 && (
                  <div>
                    <span className="text-gray-500">Production: </span>
                    <span className="text-gray-300">
                      {show.production_companies.map((c: any) => c.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
