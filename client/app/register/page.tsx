"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      const res = await axios.post(`${apiUrl}/api/auth/signup`, { name, email, password });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('cinescope_token', token);
        localStorage.setItem('cinescope_user', JSON.stringify(user));
        router.push('/');
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative bg-black">
      {/* Background Image */}
      <div className="absolute h-screen inset-0 opacity-50">
        <img src="https://images.pexels.com/photos/1649683/pexels-photo-1649683.jpeg" alt="Background" className="object-cover w-full h-full" />
      </div>
      {/* Header */}
      <div className="relative z-10 px-4 md:px-12 py-6">
        <a href="/" className="text-3xl font-bold text-red-600">CINESCOPE</a>
      </div>

      {/* Register Form */}
      <div className="relative z-10 flex items-center justify-center px-4 py-0">
        <div className="w-full max-w-md">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-10 md:p-14">
            <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
            <p className="text-gray-400 text-sm mb-8">Create your account to get started</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-orange-600/90 text-white text-sm p-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email address"
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.603A9.706 9.706 0 0112 4.5c4.5 0 8.485 2.485 10.5 6-.46.802-.998 1.555-1.6 2.25M6.19 6.184C4.29 7.34 2.78 9.018 1.5 11.25c1.5 2.625 4.5 6 10.5 6 1.088 0 2.114-.145 3.07-.415" />
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
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>

              <div className="text-sm text-gray-400">
                <label className="flex items-start cursor-pointer">
                  <input type="checkbox" className="mr-2 mt-1 w-4 h-4" required />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="text-white hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-white hover:underline">Privacy Policy</a>
                  </span>
                </label>
              </div>
            </form>

            <div className="mt-8 text-gray-400 text-base">
              Already have an account?{' '}
              <a href="/login" className="text-white hover:underline font-medium">
                Sign in now
              </a>
              .
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                By signing up, you agree to receive newsletters and promotional content. 
                You can opt out at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
}
