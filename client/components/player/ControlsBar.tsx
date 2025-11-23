"use client";
import React from 'react';

export interface ControlsBarProps {
  playing: boolean;
  onTogglePlay: () => void;
  current: number; // seconds
  duration: number; // seconds
  onSeek: (time: number) => void;
  muted: boolean;
  volume: number; // 0-1
  onVolume: (v: number) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onSettings: () => void;
  onPiP?: () => void;
  onNextEpisode?: () => void;
  nextEpisodeAvailable?: boolean;
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const mTotal = Math.floor(sec / 60);
  const h = Math.floor(mTotal / 60);
  const m = Math.floor(mTotal % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  playing,
  onTogglePlay,
  current,
  duration,
  onSeek,
  muted,
  volume,
  onVolume,
  onToggleMute,
  onFullscreen,
  onSettings,
  onPiP,
  onNextEpisode,
  nextEpisodeAvailable,
}) => {
  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="w-full select-none">
      {/* Seek bar */}
      <div className="w-full flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Number.isFinite(current) ? current : 0}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full accent-red-500"
          aria-label="Seek"
        />
      </div>

      {/* Controls row */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-white text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={onToggleMute}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "Unmute" : "Mute"}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={Number.isFinite(volume) ? volume : 1}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            className="w-28 accent-white"
            aria-label="Volume"
          />

          <div className="ml-2 tabular-nums text-xs opacity-80">
            {formatTime(current)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPiP && (
            <button
              onClick={onPiP}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              aria-label="Picture in Picture"
            >
              PiP
            </button>
          )}
          <button
            onClick={onFullscreen}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label="Fullscreen"
          >
            Fullscreen
          </button>
          <button
            onClick={onSettings}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label="Settings"
          >
            Settings
          </button>
          {onNextEpisode && nextEpisodeAvailable && (
            <button
              onClick={onNextEpisode}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
              aria-label="Next episode"
            >
              Next ▶
            </button>
          )}
        </div>
      </div>

      {/* Visual tiny progress indicator for accessibility (optional) */}
      <div className="mt-2 h-1 w-full bg-white/10 rounded">
        <div
          className="h-1 bg-red-500 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ControlsBar;
