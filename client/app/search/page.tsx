"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);

  useEffect(() => {
 
    if (initial !== q) {
      // no-op; only sync when user submits
    }
    
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(`/search?q=${encodeURIComponent(query)}`);
   
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <main className="pt-28 px-4 md:px-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Search</h1>
        <form onSubmit={onSubmit} className="max-w-3xl">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pl-12 pr-32 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
            >
              Search
            </button>
          </div>
        </form>

  
        <section className="mt-10">
          <h2 className="text-xl text-gray-300 mb-4">Results {q ? `for "${q}"` : ''}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {[
              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
              'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&q=80',
              'https://images.pexels.com/photos/8273643/pexels-photo-8273643.jpeg',
              'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80',
              'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=400&q=80',
              'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&q=80'
            ].map((img, i) => (
              <div key={i} className="group relative aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden">
                <img src={img} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 mb-24">
          <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400">
              Full search coming soon — this page will fetch live data from TMDB and support filters & pagination.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
