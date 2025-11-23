"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SafeNav from '../../components/SafeNav';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [backendTest, setBackendTest] = useState<string>('Not tested');

  useEffect(() => {
    // Read localStorage
    const token = localStorage.getItem('cinescope_token');
    const user = localStorage.getItem('cinescope_user');
    
    setLocalStorageData({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
      user: user ? JSON.parse(user) : null
    });
  }, []);

  const testBackend = async () => {
    setBackendTest('Testing...');
    const token = localStorage.getItem('cinescope_token');
    if (!token) {
      setBackendTest('❌ No token in localStorage');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://capstone3-6ywq.onrender.com';
      const response = await fetch(`${apiUrl}/api/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackendTest(`✅ Success! Got ${data.favorites?.length || 0} favorites`);
      } else {
        setBackendTest(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      setBackendTest(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SafeNav />
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Authentication Debug</h1>

        <div className="space-y-6">
          {/* NextAuth Session */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Status:</strong> {status}</div>
              <div><strong>Has Session:</strong> {session ? '✅ Yes' : '❌ No'}</div>
              {session?.user && (
                <>
                  <div><strong>Email:</strong> {session.user.email}</div>
                  <div><strong>Name:</strong> {session.user.name}</div>
                  <div><strong>Provider:</strong> {(session.user as any).provider || 'unknown'}</div>
                  <div><strong>Has Backend Token:</strong> {(session.user as any).backendToken ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Has Backend User:</strong> {(session.user as any).backendUser ? '✅ Yes' : '❌ No'}</div>
                </>
              )}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-400">Show Full Session Data</summary>
              <pre className="mt-2 bg-black p-4 rounded overflow-auto text-xs">
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          </div>

          {/* localStorage */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">localStorage</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Has Token:</strong> {localStorageData?.hasToken ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Token Length:</strong> {localStorageData?.tokenLength}</div>
              <div><strong>Token Preview:</strong> <code className="bg-black px-2 py-1 rounded">{localStorageData?.tokenPreview}</code></div>
              <div><strong>User Data:</strong> {localStorageData?.user ? '✅ Yes' : '❌ No'}</div>
              {localStorageData?.user && (
                <div className="ml-4 mt-2">
                  <div>• Name: {localStorageData.user.name}</div>
                  <div>• Email: {localStorageData.user.email}</div>
                  <div>• Provider: {localStorageData.user.provider}</div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const token = localStorage.getItem('cinescope_token');
                const user = localStorage.getItem('cinescope_user');
                setLocalStorageData({
                  hasToken: !!token,
                  tokenLength: token?.length || 0,
                  tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
                  user: user ? JSON.parse(user) : null
                });
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              🔄 Refresh localStorage Data
            </button>
          </div>

          {/* Backend Connection Test */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
            <div className="space-y-2 text-sm mb-4">
              <div><strong>Status:</strong> {backendTest}</div>
            </div>
            <button
              onClick={testBackend}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              🧪 Test Backend API
            </button>
          </div>

          {/* Troubleshooting */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🛠️ Troubleshooting</h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                <strong>If "Has Backend Token" is ❌ No:</strong>
                <ol className="ml-4 mt-2 list-decimal space-y-1">
                  <li>Check server logs during Google login</li>
                  <li>Verify NEXT_PUBLIC_API_URL is set correctly</li>
                  <li>Check backend is running and accessible</li>
                  <li>Try logging out and logging in again</li>
                </ol>
              </div>
              
              <div className="p-3 bg-blue-900/30 border border-blue-700 rounded">
                <strong>If localStorage has no token:</strong>
                <ol className="ml-4 mt-2 list-decimal space-y-1">
                  <li>SessionSync component may not be running</li>
                  <li>Check browser console for errors</li>
                  <li>Refresh the page to trigger SessionSync</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem('cinescope_token');
                  localStorage.removeItem('cinescope_user');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Clear localStorage & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
