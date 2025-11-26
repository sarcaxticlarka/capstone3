"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import SafeNav from '../../components/SafeNav';
import Footer from '../../components/Footer';
import { getApiUrl } from '../../lib/api';
import { fetchFavorites, fetchWatchlist, fetchWatchHistory, removeFavorite, removeWatchlist, removeWatchHistory, updateProfile, updateFavorite } from '../../lib/userLists';
import { useToasts } from '../../components/ToastProvider';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingFavorite, setEditingFavorite] = useState<number | null>(null);
  const [favoriteRating, setFavoriteRating] = useState(0);
  const [favoriteNotes, setFavoriteNotes] = useState('');
  const { push } = useToasts();

  useEffect(() => {
    const handleTokenReady = () => {
      const token = localStorage.getItem('cinescope_token');
      if (token) {
        fetchUserLists(token);
      }
    };
    window.addEventListener('cinescope_token_ready', handleTokenReady);
    
    if (session && session.user) {
      const googleUser = {
        name: session.user.name || 'Google User',
        email: session.user.email,
        image: session.user.image,
        provider: 'google',
      };
      setUser(googleUser);
      localStorage.setItem('cinescope_user', JSON.stringify(googleUser));
      
      const backendToken = (session.user as any).backendToken || localStorage.getItem('cinescope_token');
      
      if (backendToken) {
        localStorage.setItem('cinescope_token', backendToken);
        fetchUserLists(backendToken);
      } else {
        setLoading(false);
      }
    } else if (status !== 'loading') {
      const storedUser = localStorage.getItem('cinescope_user');
      const token = localStorage.getItem('cinescope_token');
      
      if (!storedUser || !token) {
        router.push('/login');
      } else {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, provider: parsedUser.provider || 'email' });
        fetchUserLists(token);
      }
    }
    
    return () => {
      window.removeEventListener('cinescope_token_ready', handleTokenReady);
    };
  }, [session, status, router]);

  async function fetchUserLists(token: string) {
    setLoading(true);
    try {
      const [favs, watch, history] = await Promise.all([
        fetchFavorites(token),
        fetchWatchlist(token),
        fetchWatchHistory(token),
      ]);
      setFavorites(favs);
      setWatchlist(watch);
      setWatchHistory(history);
    } catch (e: any) {
      push('Failed to load lists: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function removeFromFavorites(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return router.push('/login');
    const prev = favorites;
    setFavorites(prev.filter((f) => f.tmdbId !== tmdbId));
    try {
      await removeFavorite(token, tmdbId);
      push('Removed favorite', 'success');
    } catch (e) {
      setFavorites(prev); // rollback
      push('Failed to remove favorite', 'error');
    }
  }

  async function removeFromWatchlist(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return router.push('/login');
    const prev = watchlist;
    setWatchlist(prev.filter((f) => f.tmdbId !== tmdbId));
    try {
      await removeWatchlist(token, tmdbId);
      push('Removed from watchlist', 'success');
    } catch (e) {
      setWatchlist(prev);
      push('Failed to remove watchlist item', 'error');
    }
  }

  async function removeFromHistory(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return router.push('/login');
    const prev = watchHistory;
    setWatchHistory(prev.filter((h) => h.tmdbId !== tmdbId));
    try {
      await removeWatchHistory(token, tmdbId);
      push('Removed from history', 'success');
    } catch (e) {
      setWatchHistory(prev);
      push('Failed to remove history item', 'error');
    }
  }

  function handleEmailLogout() {
    localStorage.removeItem('cinescope_token');
    localStorage.removeItem('cinescope_user');
    router.push('/login');
  }

  async function handleUpdateName() {
    const token = localStorage.getItem('cinescope_token');
    if (!token || !newName.trim()) {
      push('Please enter a valid name', 'error');
      return;
    }
    
    try {
      const updatedUser = await updateProfile(token, { name: newName.trim() });
      setUser((prev: any) => ({ ...prev, name: updatedUser.name }));
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('cinescope_user') || '{}');
      storedUser.name = updatedUser.name;
      localStorage.setItem('cinescope_user', JSON.stringify(storedUser));
      
      setEditingName(false);
      push('Name updated successfully!', 'success');
    } catch (e: any) {
      push('Failed to update name: ' + (e.message || 'Unknown error'), 'error');
    }
  }

  async function handleUpdateFavorite(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return;
    
    try {
      const updatedFavorites = await updateFavorite(token, tmdbId, {
        personalRating: favoriteRating,
        notes: favoriteNotes.trim()
      });
      
      setFavorites(updatedFavorites);
      setEditingFavorite(null);
      push('Rating & notes saved!', 'success');
    } catch (e: any) {
      push('Failed to update: ' + (e.message || 'Unknown error'), 'error');
    }
  }

  function startEditingFavorite(item: any) {
    setEditingFavorite(item.tmdbId);
    setFavoriteRating(item.personalRating || 0);
    setFavoriteNotes(item.notes || '');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SafeNav />

      <main className="pt-28 px-4 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Profile</h1>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 space-y-6 mb-8">
            {user.image && (
              <div className="flex justify-center mb-4">
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full border-4 border-gray-700 object-cover" 
                />
              </div>
            )}
            
            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Name</label>
              {editingName ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter new name"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xl text-white">{user.name || 'Not provided'}</p>
                  <button
                    onClick={() => {
                      setNewName(user.name || '');
                      setEditingName(true);
                    }}
                    className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Email</label>
              <p className="text-xl text-white mt-1 break-all">{user.email}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Login Method</label>
              <p className="text-xl text-white mt-1">
                {user.provider === 'google' ? (
                  <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.69 30.13 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.19C12.13 13.41 17.56 9.5 24 9.5z"/>
                        <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.91-2.18 5.38-4.65 7.04l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/>
                        <path fill="#FBBC05" d="M10.67 28.28a14.5 14.5 0 0 1 0-8.56l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.47l7.98-6.19z"/>
                        <path fill="#EA4335" d="M24 48c6.13 0 11.64-2.02 15.84-5.5l-7.19-5.59c-2.01 1.35-4.59 2.15-8.65 2.15-6.44 0-11.87-3.91-13.33-9.28l-7.98 6.19C6.73 42.18 14.82 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                      </g>
                    </svg>
                    Google
                  </span>
                ) : (
                  'Email / Password'
                )}
              </p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Member Since</label>
              <p className="text-xl text-white mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => user.provider === 'google' ? signOut({ callbackUrl: '/login' }) : handleEmailLogout()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded transition"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Recently Watched Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Recently Watched ({watchHistory.length})</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : watchHistory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchHistory.slice(0, 12).map((item: any) => (
                  <div key={item.tmdbId} className="group relative rounded-lg overflow-hidden bg-gray-800">
                    <a href={item.media_type === 'tv' ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`}>
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-xs text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.watchedAt ? new Date(item.watchedAt).toLocaleDateString() : ''}
                        </p>
                        <button
                          onClick={() => removeFromHistory(item.tmdbId)}
                          className="mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 bg-gray-900 rounded-lg p-8 text-center">
                No watch history yet. Start watching movies and TV shows!
              </div>
            )}
          </section>

          {/* Favorites Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Favorites ({favorites.length})</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favorites.map((item: any) => (
                  <div key={item.tmdbId} className="group relative rounded-lg overflow-hidden bg-gray-800">
                    <a href={item.media_type === 'tv' ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`}>
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    
                    {/* Show rating if exists */}
                    {item.personalRating > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-2 py-1 rounded text-xs">
                        ⭐ {item.personalRating}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-xs text-white truncate">{item.title}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-300 truncate italic mt-1">"{item.notes}"</p>
                        )}
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => startEditingFavorite(item)}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            ⭐ Rate
                          </button>
                          <button
                            onClick={() => removeFromFavorites(item.tmdbId)}
                            className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 bg-gray-900 rounded-lg p-8 text-center">
                No favorites yet. Add movies and TV shows to your favorites!
              </div>
            )}
          </section>

          {/* Rating Modal */}
          {editingFavorite !== null && (
            <>
              <div 
                className="fixed inset-0 bg-black/70 z-40"
                onClick={() => setEditingFavorite(null)}
              />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
                <h3 className="text-white text-xl font-bold mb-4">Rate & Review</h3>
                
                {/* Rating Slider */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">
                    Your Rating: <span className="text-yellow-500 font-bold">{favoriteRating}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={favoriteRating}
                    onChange={(e) => setFavoriteRating(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
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
                    Your Notes <span className="text-gray-600">({favoriteNotes.length}/500)</span>
                  </label>
                  <textarea
                    value={favoriteNotes}
                    onChange={(e) => setFavoriteNotes(e.target.value)}
                    placeholder="Add your personal notes, thoughts, or review..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg resize-none border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateFavorite(editingFavorite)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingFavorite(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Watchlist Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Your Watchlist ({watchlist.length})</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.map((item: any) => (
                  <div key={item.tmdbId} className="group relative rounded-lg overflow-hidden bg-gray-800">
                    <a href={item.media_type === 'tv' ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`}>
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-xs text-white truncate">{item.title}</p>
                        <button
                          onClick={() => removeFromWatchlist(item.tmdbId)}
                          className="mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 bg-gray-900 rounded-lg p-8 text-center">
                No items in watchlist. Add something to watch later!
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
