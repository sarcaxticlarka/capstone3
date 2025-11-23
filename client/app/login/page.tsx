"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '../../lib/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('cinescope_token', token);
        localStorage.setItem('cinescope_user', JSON.stringify(user));
        router.push('/');
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Bg Image */}
      <div className="absolute inset-0 opacity-50">
        <img
          src="https://images.pexels.com/photos/1649683/pexels-photo-1649683.jpeg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 md:px-12 py-6">
        <a href="/" className="text-3xl font-bold text-red-600">CINESCOPE</a>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-10 md:p-14">
            <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>
            <GoogleAuthButton />
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-700" />
              <span className="mx-4 text-gray-400">or</span>
              <div className="flex-grow h-px bg-gray-700" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-orange-600/90 text-white text-sm p-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email or phone number"
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full pr-12 px-4 py-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white"
                  >
                    {showPassword ? (
                      // Eye off icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.584 10.587A3 3 0 0012 15a3 3 0 002.829-1.987M9.88 4.603A9.706 9.706 0 0112 4.5c4.5 0 8.485 2.485 10.5 6-.
                        46.802-.998 1.555-1.6 2.25M6.19 6.184C4.29 7.34 2.78 9.018 1.5 11.25c1.5 2.625 4.5 6 10.5 6 1.088 0 2.114-.145 3.07-.415" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.07.214.07.43 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-400 cursor-pointer">
                  <input type="checkbox" className="mr-2 w-4 h-4" />
                  Remember me
                </label>
                <a href="#" className="text-gray-400 hover:text-gray-300 transition">
                  Need help?
                </a>
              </div>
            </form>

            <div className="mt-8 text-gray-400 text-base">
              New to CineScope?{' '}
              <a href="/register" className="text-white hover:underline font-medium">
                Sign up now
              </a>
              .
            </div>

           
          </div>
        </div>
      </div>

      
    </div>
  );
}
