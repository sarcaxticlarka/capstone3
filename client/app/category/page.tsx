import React, { Suspense } from 'react';
import CategoryContent from './CategoryContent';
import SafeNav from '../../components/SafeNav';
import Footer from '../../components/Footer';
import MovieCardSkeleton from '../../components/MovieCardSkeleton';

export const dynamic = 'force-dynamic';

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <SafeNav />
        <main className="pt-28 px-4 md:px-12 pb-24">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Loading...</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
