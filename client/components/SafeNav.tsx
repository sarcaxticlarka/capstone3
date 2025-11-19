import { Suspense } from 'react';
import Nav from './Nav';

// Fallback Nav component for loading state
function NavFallback() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="px-6 md:px-12 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">CineScope</h1>
      </div>
    </nav>
  );
}

export default function SafeNav() {
  return (
    <Suspense fallback={<NavFallback />}>
      <Nav />
    </Suspense>
  );
}
