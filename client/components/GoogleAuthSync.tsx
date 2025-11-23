"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getApiUrl } from '../lib/api';
import axios from 'axios';

/**
 * This component handles syncing Google OAuth users with the backend
 * It runs on the client side after NextAuth session is established
 */
export default function GoogleAuthSync() {
  const { data: session, status } = useSession();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function syncGoogleUser() {
      if (status !== 'authenticated' || !session?.user) {
        return;
      }

      if (synced) {
        return;
      }

      const provider = (session.user as any).provider;
      
      if (provider !== 'google') {
        return; // Only sync Google users
      }

      try {
        const apiUrl = getApiUrl();
        
        const response = await axios.post(`${apiUrl}/api/auth/google-login`, {
          email: session.user.email,
          name: session.user.name,
          googleId: (session.user as any).id || 'google-' + session.user.email,
          image: session.user.image,
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.token) {
          // Store the backend token
          localStorage.setItem('cinescope_token', response.data.token);
          
          // Store user info
          const userInfo = {
            name: session.user.name || response.data.user?.name || 'Google User',
            email: session.user.email,
            image: session.user.image || response.data.user?.image,
            provider: 'google',
          };
          localStorage.setItem('cinescope_user', JSON.stringify(userInfo));

          // Dispatch event to notify other components
          window.dispatchEvent(new Event('cinescope_token_ready'));
          
          setSynced(true);
        }
      } catch (error: any) {
        // Silently fail - user can still browse but won't be able to use backend features
      }
    }

    syncGoogleUser();
  }, [session, status, synced]);

  return null; // This component doesn't render anything
}
