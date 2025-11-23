"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ControlsBar } from './player/ControlsBar';
import { SettingsMenu } from './player/SettingsMenu';
import { usePlaybackPersistence } from './player/usePlaybackPersistence';

interface SourceVariant {
  label: string;
  url: string;
}

interface CaptionTrack {
  label: string;
  src: string;
  lang: string;
  default?: boolean;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  variants?: SourceVariant[];
  captions?: CaptionTrack[];
  mediaKey?: string; // unique id for persistence (movie or episode id)
  onAutoNext?: () => void; // callback to trigger next episode when finished
  autoNextThresholdSeconds?: number; // time from end to show next prompt
  nextEpisodeAvailable?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, poster, variants = [], captions = [], mediaKey = 'default', onAutoNext, autoNextThresholdSeconds = 25, nextEpisodeAvailable }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHls = /\.m3u8($|\?)/.test(src);
  const isDirectMedia = /\.(mp4|webm|m3u8)($|\?)/.test(src) || src.startsWith('blob:');
  const isEmbed = !isDirectMedia; // treat unknown (like vidsrc embed HTML) as iframe

  // HLS setup
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    const video = videoRef.current;
    if (!video) return;
    if (!isHls || !isDirectMedia) return;
    const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
    if (canPlayNative) {
      video.src = src; // Safari native
      return;
    }
    // Attempt local module first
    // @ts-ignore
    import('hls.js').then((HlsMod: any) => {
      const Hls = HlsMod.default || HlsMod;
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    }).catch(() => {
      // Fallback: inject CDN script if module missing
      if (!(window as any).Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js';
        script.async = true;
        script.onload = () => {
          const Hls = (window as any).Hls;
          if (Hls && Hls.isSupported && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
          }
        };
        document.head.appendChild(script);
      }
    });
  }, [src, isHls, isDirectMedia]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [activeCaption, setActiveCaption] = useState<string | null>(captions.find(c => c.default)?.lang || null);
  const [quality, setQuality] = useState<string>('default');
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitleStyle, setSubtitleStyle] = useState({ size: 22, color: '#ffffff', background: true });
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current; if (!v) return;
    setProgress(v.currentTime);
  };

  const handleLoaded = () => {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration || 0);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = parseFloat(e.target.value);
    v.currentTime = val;
    setProgress(val);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val; setVolume(val);
  };

  // Persistence
  usePlaybackPersistence({
    mediaKey,
    video: videoRef.current,
    playbackRate,
    onRestore: (time, rate) => {
      setPlaybackRate(rate || 1);
      setProgress(time || 0);
    }
  });

  const handleCaptionChange = (lang: string | null) => {
    setActiveCaption(lang);
    const v = videoRef.current; if (!v) return;
    const tracks = v.textTracks;
    for (let i=0;i<tracks.length;i++) {
      tracks[i].mode = tracks[i].language === lang ? 'showing' : 'disabled';
    }
  };

  const handleVariantChange = (label: string) => {
    setQuality(label);
    const chosen = variants.find(v => v.label === label);
    if (chosen && videoRef.current) {
      const wasPlaying = !videoRef.current.paused;
      videoRef.current.src = chosen.url;
      videoRef.current.load();
      if (wasPlaying) videoRef.current.play();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls, progress, playing]);

  const onMouseMove = () => setShowControls(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10); break;
        case 'ArrowRight': videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10); break;
        case 'f':
          if (document.fullscreenElement) document.exitFullscreen(); else videoRef.current.requestFullscreen();
          break;
        case 'm':
          setMuted(m => !m);
          if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay]);

  // Auto-next prompt
  useEffect(() => {
    if (!onAutoNext || !nextEpisodeAvailable) return;
    if (duration > 0 && duration - progress <= autoNextThresholdSeconds) {
      setShowNextPrompt(true);
    } else {
      setShowNextPrompt(false);
    }
  }, [progress, duration, onAutoNext, autoNextThresholdSeconds, nextEpisodeAvailable]);

  const triggerNext = () => { if (onAutoNext) onAutoNext(); };

  const applyPlaybackRate = (r: number) => {
    setPlaybackRate(r);
    if (videoRef.current) videoRef.current.playbackRate = r;
  };

  if (isEmbed) {
    // Fallback: render iframe when we do not have a direct media file
    return (
      <div className="relative w-full h-full bg-black" onMouseMove={onMouseMove}>
        <iframe
          title={title || 'Embedded Player'}
          src={src}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center text-white text-xs bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <span className="font-semibold pointer-events-auto">{title}</span>
          <span className="pointer-events-auto bg-white/10 px-2 py-1 rounded">External Embed</span>
        </div>
        {/* Note: Cannot control play/pause for cross-origin iframe. Provide hint. */}
        <div className="absolute bottom-4 left-4 text-white/60 text-[11px] bg-black/50 px-2 py-1 rounded max-w-xs">
          This source is an external embed. For custom controls, supply a direct .mp4 or .m3u8 URL.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black" onMouseMove={onMouseMove}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        controls={false}
        autoPlay
        onClick={togglePlay}
        onDoubleClick={() => {
          if (!videoRef.current) return;
          if (document.fullscreenElement) document.exitFullscreen(); else videoRef.current.requestFullscreen();
        }}
        style={{
          // Subtitle styling will be applied via ::cue pseudo; fallback simple filter could be used
        }}
      >
        {!isHls && <source src={src} />}
        {captions.map(c => (
          <track
            key={c.lang}
            label={c.label}
            kind="subtitles"
            srcLang={c.lang}
            src={c.src}
            default={c.default}
          />
        ))}
      </video>
      {showControls && (
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          <div className="p-4 space-y-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-auto">
            {/* Top row */}
            <div className="flex justify-between items-center text-white text-sm">
              <div className="font-medium truncate max-w-[60%]">{title || 'Untitled'}</div>
              <div className="flex gap-2 items-center">
                {variants.length > 0 && (
                  <select
                    value={quality}
                    onChange={e => handleVariantChange(e.target.value)}
                    className="bg-white/10 rounded px-2 py-1 text-xs"
                  >
                    <option value="default">Quality</option>
                    {variants.map(v => <option key={v.label} value={v.label}>{v.label}</option>)}
                  </select>
                )}
                {captions.length > 0 && (
                  <select
                    value={activeCaption || ''}
                    onChange={e => handleCaptionChange(e.target.value || null)}
                    className="bg-white/10 rounded px-2 py-1 text-xs"
                  >
                    <option value="">Captions Off</option>
                    {captions.map(c => <option key={c.lang} value={c.lang}>{c.label}</option>)}
                  </select>
                )}
                <button onClick={() => setSettingsOpen(o=>!o)} className="px-2 py-1 bg-white/10 rounded text-xs">⚙</button>
              </div>
            </div>
            <ControlsBar
              playing={playing}
              onTogglePlay={togglePlay}
              onSeek={(t)=> { if (videoRef.current) { videoRef.current.currentTime = t; setProgress(t); } }}
              current={progress}
              duration={duration}
              muted={muted}
              volume={volume}
              onVolume={(v)=> { if (videoRef.current){ videoRef.current.volume=v; setVolume(v); if (v>0) { videoRef.current.muted=false; setMuted(false);} } }}
              onToggleMute={()=> { if (videoRef.current){ videoRef.current.muted=!videoRef.current.muted; setMuted(videoRef.current.muted); } }}
              onFullscreen={()=> { if (!videoRef.current) return; if (document.fullscreenElement) document.exitFullscreen(); else videoRef.current.requestFullscreen(); }}
              onSettings={()=> setSettingsOpen(o=>!o)}
              onPiP={()=> { if(videoRef.current){ if (document.pictureInPictureElement){ (document as any).exitPictureInPicture(); } else { (videoRef.current as any).requestPictureInPicture?.(); } } }}
              onNextEpisode={showNextPrompt? triggerNext: undefined}
              nextEpisodeAvailable={nextEpisodeAvailable && showNextPrompt}
            />
            {showNextPrompt && nextEpisodeAvailable && (
              <div className="absolute bottom-28 right-6 bg-black/80 text-white px-4 py-2 rounded shadow text-xs flex items-center gap-3">
                <span>Next episode starting soon...</span>
                <button onClick={triggerNext} className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded">Play Now</button>
              </div>
            )}
          </div>
        </div>
      )}
      <SettingsMenu
        open={settingsOpen}
        playbackRate={playbackRate}
        onRateChange={applyPlaybackRate}
        subtitle={subtitleStyle}
        onSubtitleChange={setSubtitleStyle}
        onClose={()=> setSettingsOpen(false)}
      />
    </div>
  );
};
