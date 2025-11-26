"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SafeNav from '../../../components/SafeNav';
import Footer from '../../../components/Footer';
import { getApiUrl } from '../../../lib/api';
import { addFavorite, removeFavorite, addWatchlist, removeWatchlist, favoriteExists, updateFavorite } from '../../../lib/userLists';
import { useToasts } from '../../../components/ToastProvider';

export const dynamic = 'force-dynamic';

export default function MoviePage() {
  const params = useParams();
  const id = params?.id as string;
  const [movie, setMovie] = useState<any>(null);
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
        const res = await fetch(`/api/tmdb/movie/${id}`);
        const data = await res.json();
        if (!mounted) return;
        setMovie(data);
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
    // check if movie is in user's favorites/watchlist (if logged in)
    async function checkLists() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
      if (!token) return;
      
      try {
        const apiUrl = getApiUrl();
        // Favorites existence quick check
        if (token) {
          const favExists = await favoriteExists(token, Number(id));
          setInFavorites(favExists);
        }
        // Watchlist still needs full fetch (could add exists endpoint later)
        const wRes = await fetch(`${apiUrl}/api/user/watchlist`, { headers: { Authorization: `Bearer ${token}` } });
        const wjson = await wRes.json();
        const watch = wjson.watchlist || [];
        setInWatchlist(watch.some((f: any) => f.tmdbId === Number(id)));
      } catch (e) {}
    }
    
    checkLists();
    
    // Also listen for token ready event (for Google login)
    const handleTokenReady = () => {
      console.log('Token ready event received, rechecking lists');
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
  
  if (!movie || movie.status_code === 34) return (
    <div className="min-h-screen bg-black">
      <SafeNav />
      <div className="pt-24 px-6 text-white text-center">Movie not found.</div>
      <Footer />
    </div>
  );

  async function handleAddFavorite() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cinescope_user') : null;
    
    if (!token) {
      push('Please log in to add favorites', 'error');
      
      setTimeout(() => {
        const retryToken = localStorage.getItem('cinescope_token');
        if (retryToken) {
          handleAddFavorite();
        } else {
          router.push('/login');
        }
      }, 500);
      return;
    }
    
    setFavLoading(true);
    setInFavorites(true);
    try {
      await addFavorite(token!, { tmdbId: Number(id), media_type: 'movie', title: movie.title, poster_path: movie.poster_path, backdrop_path: movie.backdrop_path });
      push('Added to favorites ✓', 'success');
    } catch (e:any) {
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
    } catch (e:any) {
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
      await addWatchlist(token!, { tmdbId: Number(id), media_type: 'movie', title: movie.title, poster_path: movie.poster_path, backdrop_path: movie.backdrop_path });
      push('Added to watchlist ✓', 'success');
    } catch (e:any) {
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
    } catch (e:any) {
      setInWatchlist(prev);
      push('Failed to remove watchlist', 'error');
    }
    setFavLoading(false);
  }

  async function handleRateMovie() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cinescope_token') : null;
    if (!token) {
      push('Please log in to rate movies', 'error');
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
          {movie.backdrop_path && (
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
              <img 
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              {movie.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  className="rounded-lg w-full shadow-2xl" 
                />
              ) : (
                <div className="bg-gray-800 rounded-lg w-full h-96 flex items-center justify-center">
                  <span className="text-gray-500">No poster</span>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex items-center gap-4 text-gray-400 mb-6">
                {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
                {movie.runtime && <span>· {movie.runtime} min</span>}
                {movie.vote_average && (
                  <span className="flex items-center gap-1">
                    · ⭐ {movie.vote_average.toFixed(1)}/10
                  </span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((g: any) => (
                    <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 text-lg mb-8 leading-relaxed">{movie.overview}</p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a 
                  href={`/player/movie/${id}`}
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
                  onClick={handleRateMovie} 
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Rate This Movie
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 text-sm">
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <span className="text-gray-500">Production: </span>
                    <span className="text-gray-300">
                      {movie.production_companies.map((c: any) => c.name).join(', ')}
                    </span>
                  </div>
                )}
                
                {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                  <div>
                    <span className="text-gray-500">Languages: </span>
                    <span className="text-gray-300">
                      {movie.spoken_languages.map((l: any) => l.english_name).join(', ')}
                    </span>
                  </div>
                )}

                {movie.budget > 0 && (
                  <div>
                    <span className="text-gray-500">Budget: </span>
                    <span className="text-gray-300">
                      ${movie.budget.toLocaleString()}
                    </span>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div>
                    <span className="text-gray-500">Revenue: </span>
                    <span className="text-gray-300">
                      ${movie.revenue.toLocaleString()}
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
              <h3 className="text-white text-xl font-bold">Rate "{movie?.title}"</h3>
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
