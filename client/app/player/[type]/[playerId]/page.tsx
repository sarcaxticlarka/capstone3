"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getApiUrl } from '../../../../lib/api';
import { addWatchHistory } from '../../../../lib/userLists';
import { useToasts } from '../../../../components/ToastProvider';

export default function PlayerPage() {
  const params = useParams();
  const type = params?.type as string;
  const playerId = params?.playerId as string;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const { push } = useToasts();

  useEffect(() => {
    async function trackWatch() {
      const token = localStorage.getItem('cinescope_token');
      if (!token || !playerId || !type) {
        return;
      }
      
      try {
        const detailRes = await fetch(`/api/tmdb/${type}/${playerId}`);
        const details = await detailRes.json();
        
        await addWatchHistory(token, {
          tmdbId: parseInt(playerId),
          media_type: type,
          title: details.title || details.name,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
        });
        
        push('Added to watch history ✓', 'success');
        setNotificationMessage(`Now watching: ${details.title || details.name}`);
        setNotificationType('success');
        setShowNotification(true);
        
        setTimeout(() => setShowNotification(false), 4000);
      } catch (e) {
        push('Failed to record watch', 'error');
        setNotificationMessage('Failed to record watch history');
        setNotificationType('error');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }
    }
    trackWatch();
  }, [playerId, type, push]);

  if (!playerId || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="p-6">Invalid video link.</div>
      </div>
    );
  }

  const actualType = !type || type === 'undefined' ? 'tv' : type;
  const embedURL = `https://vidsrc.xyz/embed/${actualType}/${playerId}`;

  return (
    <div className="w-full h-screen flex justify-center items-center bg-black fixed top-0 left-0 z-50">
      {/* On-screen notification */}
      {showNotification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl transition-all duration-300 ${
          notificationType === 'success' 
            ? 'bg-green-600/95 text-white' 
            : 'bg-red-600/95 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notificationType === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}
      
      <iframe
        className="w-full h-screen"
        title="Video Player"
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        src={embedURL}
      ></iframe>
    </div>
  );
}
