"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const backendToken = (session.user as any).backendToken;
      const backendUser = (session.user as any).backendUser;
      
      if (backendToken) {
        localStorage.setItem('cinescope_token', backendToken);
        
        const userInfo = {
          name: session.user.name || backendUser?.name || 'Google User',
          email: session.user.email,
          image: session.user.image || backendUser?.image,
          provider: 'google',
        };
        localStorage.setItem('cinescope_user', JSON.stringify(userInfo));
        
        window.dispatchEvent(new Event('cinescope_token_ready'));
      }
    } else if (status === 'unauthenticated') {
      const storedUser = localStorage.getItem('cinescope_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.provider === 'google') {
            localStorage.removeItem('cinescope_token');
            localStorage.removeItem('cinescope_user');
          }
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}
