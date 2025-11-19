"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GenresDropdown from './GenresDropdown';

export default function Nav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [q, setQ] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('cinescope_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // initialize search input from URL if present
    try {
      const val = searchParams?.get('q') || '';
      setQ(val);
    } catch (e) {
      // ignore in SSR or if searchParams unavailable
    }
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('cinescope_token');
    localStorage.removeItem('cinescope_user');
    setUser(null);
    router.push('/login');
  };

  // Close modal with ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav className={`bg-black p-1 fixed top-0 w-full z-50 transition-colors duration-300`}>
      <div className="px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-3xl font-bold text-red-600">CINESCOPE</a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-white hover:text-gray-300 transition text-sm font-medium">Home</a>
            <a href="/films" className="text-gray-400 hover:text-gray-300 transition text-sm">Movies</a>
            <a href="/TV-Shows" className="text-gray-400 hover:text-gray-300 transition text-sm">TV Shows</a>
            <GenresDropdown />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Inline search (updates URL q=...) */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-3xl px-3 py-2 mr-2">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => {
                const val = e.target.value;
                setQ(val);
                
                // Debounce: clear previous timer and set a new one
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                
                debounceTimer.current = setTimeout(() => {
                  // Update URL without adding history entries on each keystroke
                  if (val.trim() !== '') {
                    router.replace(`/search?q=${encodeURIComponent(val)}`);
                  } else {
                    router.replace(`/`);
                  }
                }, 500); // 500ms debounce delay
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = q.trim();
                  if (val) {
                    // Clear debounce and navigate immediately
                    if (debounceTimer.current) clearTimeout(debounceTimer.current);
                    router.push(`/search?q=${encodeURIComponent(val)}`);
                  }
                }
              }}
              placeholder="Search for movies or TV shows..."
              aria-label="Search"
              className="bg-transparent outline-none text-white placeholder-gray-400 ml-3 w-56 sm:w-72"
            />
          </div>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setProfileOpen((s) => !s)}
                className="px-4 py-2 text-white hover:text-gray-300 transition text-sm font-medium"
                aria-haspopup="dialog"
                aria-expanded={profileOpen}
                aria-controls="profile-modal"
              >
                Profile
              </button>

              {/* Modal Overlay */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    id="profile-modal"
                    role="dialog"
                    aria-modal="true"
                    className="fixed right-4 top-16 z-[60] w-80 bg-[#0b0b0b] border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-gray-800">
                      <h3 className="text-white text-lg font-semibold">Your Profile</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-xs uppercase text-gray-500">Name</p>
                        <p className="text-white font-medium">{user.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">Email</p>
                        <p className="text-white font-medium break-all">{user.email}</p>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        <a
                          href="/profile"
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          View Profile
                        </a>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <a href="/login" className="px-4 py-2 text-white hover:text-gray-300 transition text-sm font-medium">Sign In</a>
              <a href="/register" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition">Join Now</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
