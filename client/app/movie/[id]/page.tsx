"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SafeNav from '../../../components/SafeNav';
import Footer from '../../../components/Footer';
import { getApiUrl } from '../../../lib/api';
import { addFavorite, removeFavorite, addWatchlist, removeWatchlist, favoriteExists } from '../../../lib/userLists';
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
      <Footer />
    </div>
  );
}
