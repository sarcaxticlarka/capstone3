"use client";
import { useEffect } from 'react';

interface Params {
  mediaKey: string;
  video: HTMLVideoElement | null;
  playbackRate: number;
  onRestore?: (time: number, rate: number) => void;
}

const STORAGE_PREFIX = 'player:';

export function usePlaybackPersistence({ mediaKey, video, playbackRate, onRestore }: Params) {
  // Restore when we get a video element or key changes
  useEffect(() => {
    if (!mediaKey) return;
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + mediaKey);
      if (raw) {
        const data = JSON.parse(raw) as { t?: number; r?: number };
        if (onRestore) onRestore(data.t ?? 0, data.r ?? 1);
        if (video && typeof data.t === 'number') {
          // Seek slightly after to avoid 0 edge cases
          video.currentTime = Math.max(0, Math.min(video.duration || data.t, data.t));
        }
        if (video && typeof data.r === 'number') {
          video.playbackRate = data.r;
        }
      }
    } catch {
      // ignore
    }
  }, [mediaKey, video]);

  // Persist on time updates and when playback rate changes
  useEffect(() => {
    if (!mediaKey || !video) return;

    const save = () => {
      try {
        const payload = JSON.stringify({ t: video.currentTime || 0, r: video.playbackRate || playbackRate || 1 });
        localStorage.setItem(STORAGE_PREFIX + mediaKey, payload);
      } catch {
        // ignore
      }
    };

    const onRate = () => save();

    video.addEventListener('timeupdate', save);
    video.addEventListener('ratechange', onRate);
    window.addEventListener('beforeunload', save);

    return () => {
      video.removeEventListener('timeupdate', save);
      video.removeEventListener('ratechange', onRate);
      window.removeEventListener('beforeunload', save);
    };
  }, [mediaKey, video, playbackRate]);
}

export default usePlaybackPersistence;
