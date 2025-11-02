"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('cinescope_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <main className="pt-28 px-4 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Profile</h1>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8 space-y-6">
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

            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Full profile editing and account management features coming soon.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
