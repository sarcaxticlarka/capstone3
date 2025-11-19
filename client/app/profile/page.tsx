"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SafeNav from '../../components/SafeNav';
import Footer from '../../components/Footer';
import { getApiUrl } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cinescope_user');
    const token = localStorage.getItem('cinescope_token');
    if (!storedUser || !token) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchUserLists(token);
    }
  }, [router]);

  async function fetchUserLists(token: string) {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const [fRes, wRes, hRes] = await Promise.all([
        fetch(`${apiUrl}/api/user/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/user/watchlist`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/user/watch-history`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const fjson = await fRes.json();
      const wjson = await wRes.json();
      const hjson = await hRes.json();
      setFavorites(fjson.favorites || []);
      setWatchlist(wjson.watchlist || []);
      setWatchHistory(hjson.watchHistory || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromFavorites(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/user/favorites/${tmdbId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.tmdbId !== tmdbId));
      }
    } catch (e) {}
  }

  async function removeFromWatchlist(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/user/watchlist/${tmdbId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((f) => f.tmdbId !== tmdbId));
      }
    } catch (e) {}
  }

  async function removeFromHistory(tmdbId: number) {
    const token = localStorage.getItem('cinescope_token');
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/user/watch-history/${tmdbId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatchHistory((prev) => prev.filter((h) => h.tmdbId !== tmdbId));
      }
    } catch (e) {}
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
            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Name</label>
              <p className="text-xl text-white mt-1">{user.name || 'Not provided'}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Email</label>
              <p className="text-xl text-white mt-1 break-all">{user.email}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Member Since</label>
              <p className="text-xl text-white mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-xs text-white truncate">{item.title}</p>
                        <button
                          onClick={() => removeFromFavorites(item.tmdbId)}
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
                No favorites yet. Start adding movies and TV shows!
              </div>
            )}
          </section>

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
