"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SafeNav from '../../../components/SafeNav';
import Footer from '../../../components/Footer';
import { getApiUrl } from '../../../lib/api';
import { addFavorite, removeFavorite, addWatchlist, removeWatchlist, favoriteExists, updateFavorite } from '../../../lib/userLists';
import { useToasts } from '../../../components/ToastProvider';

export const dynamic = 'force-dynamic';

export default function TVPage() {
  const params = useParams();
  const id = params?.id as string;
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [personalRating, setPersonalRating] = useState(0);
  const [personalNotes, setPersonalNotes] = useState('');
  const router = useRouter();
  const { push } = useToasts();

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
    async function checkLists() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
      if (!token) return;
      
      try {
        const apiUrl = getApiUrl();
        if (token) {
          const favExists = await favoriteExists(token, Number(id));
          setInFavorites(favExists);
        }
        const wRes = await fetch(`${apiUrl}/api/user/watchlist`, { headers: { Authorization: `Bearer ${token}` } });
        const wjson = await wRes.json();
        const watch = wjson.watchlist || [];
        setInWatchlist(watch.some((f: any) => f.tmdbId === Number(id)));
      } catch (e) {
        // silent
      }
    }
    
    checkLists();
    
    const handleTokenReady = () => {
      checkLists();
    };
    window.addEventListener('cinescope_token_ready', handleTokenReady);
    
    return () => {
      window.removeEventListener('cinescope_token_ready', handleTokenReady);
    };
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

  const apiUrl = getApiUrl();

  async function handleAddFavorite() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    
    if (!token) {
      push('Please log in to add favorites', 'error');
      return router.push('/login');
    }
    
    setFavLoading(true);
    setInFavorites(true);
    try {
      await addFavorite(token!, { tmdbId: Number(id), media_type: 'tv', title: show.name, poster_path: show.poster_path, backdrop_path: show.backdrop_path });
      push('Added to favorites ✓', 'success');
    } catch (e) {
      setInFavorites(false);
      push('Failed to add favorite', 'error');
    }
    setFavLoading(false);
  }

  async function handleRemoveFavorite() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) {
      push('Please log in to manage favorites', 'error');
      return router.push('/login');
    }
    setFavLoading(true);
    const prev = inFavorites;
    setInFavorites(false);
    try {
      await removeFavorite(token!, Number(id));
      push('Removed from favorites', 'success');
    } catch (e) {
      setInFavorites(prev);
      push('Failed to remove favorite', 'error');
    }
    setFavLoading(false);
  }

  async function handleAddWatchlist() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    
    if (!token) {
      push('Please log in to add to watchlist', 'error');
      return router.push('/login');
    }
    
    setFavLoading(true);
    setInWatchlist(true);
    try {
      await addWatchlist(token!, { tmdbId: Number(id), media_type: 'tv', title: show.name, poster_path: show.poster_path, backdrop_path: show.backdrop_path });
      push('Added to watchlist ✓', 'success');
    } catch (e) {
      setInWatchlist(false);
      push('Failed to add watchlist', 'error');
    }
    setFavLoading(false);
  }

  async function handleRemoveWatchlist() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) {
      push('Please log in to manage watchlist', 'error');
      return router.push('/login');
    }
    setFavLoading(true);
    const prev = inWatchlist;
    setInWatchlist(false);
    try {
      await removeWatchlist(token!, Number(id));
      push('Removed from watchlist', 'success');
    } catch (e) {
      setInWatchlist(prev);
      push('Failed to remove watchlist', 'error');
    }
    setFavLoading(false);
  }

  async function handleRateShow() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) {
      push('Please log in to rate shows', 'error');
      return router.push('/login');
    }

    // First, ensure it's in favorites
    if (!inFavorites) {
      await handleAddFavorite();
    }

    // Open rating modal
    setShowRatingModal(true);
  }

  async function handleSaveRating() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) return;

    try {
      await updateFavorite(token, Number(id), {
        personalRating,
        notes: personalNotes.trim()
      });
      push('Rating saved! ⭐', 'success');
      setShowRatingModal(false);
    } catch (e: any) {
      push('Failed to save rating: ' + (e.message || 'Unknown error'), 'error');
    }
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

                <button 
                  onClick={handleRateShow} 
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Rate This Show
                </button>
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

      {/* Rating Modal */}
      {showRatingModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setShowRatingModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">Rate "{show?.name}"</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Rating Slider */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Your Rating: <span className="text-yellow-500 font-bold text-lg">{personalRating}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={personalRating}
                onChange={(e) => setPersonalRating(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Your Review <span className="text-gray-600">({personalNotes.length}/500)</span>
              </label>
              <textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="What did you think? Add your personal review or notes..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg resize-none border border-gray-700 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveRating}
                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
              >
                💾 Save Rating
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
