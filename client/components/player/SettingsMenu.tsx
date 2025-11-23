"use client";
import React from 'react';

export interface SubtitleStyle {
  size: number; // px
  color: string; // hex or css color
  background: boolean;
}

export interface SettingsMenuProps {
  open: boolean;
  playbackRate: number;
  onRateChange: (rate: number) => void;
  subtitle: SubtitleStyle;
  onSubtitleChange: (s: SubtitleStyle) => void;
  onClose: () => void;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  open,
  playbackRate,
  onRateChange,
  subtitle,
  onSubtitleChange,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="absolute right-3 bottom-24 z-20 w-64 rounded-lg bg-black/90 text-white shadow-lg border border-white/10">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="font-semibold text-sm">Settings</div>
        <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100">Close</button>
      </div>

      <div className="p-3 space-y-4 text-sm">
        {/* Playback rate */}
        <div>
          <div className="mb-2 font-medium opacity-80">Playback speed</div>
          <div className="flex flex-wrap gap-2">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => onRateChange(r)}
                className={`px-2 py-1 rounded border ${playbackRate === r ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>

        {/* Subtitles */}
        <div>
          <div className="mb-2 font-medium opacity-80">Subtitles</div>
          <label className="flex items-center justify-between gap-2 mb-2">
            <span className="opacity-80">Font size</span>
            <input
              type="range"
              min={12}
              max={40}
              step={1}
              value={subtitle.size}
              onChange={(e) => onSubtitleChange({ ...subtitle, size: parseInt(e.target.value, 10) })}
              className="w-32 accent-white"
            />
          </label>

          <label className="flex items-center justify-between gap-2 mb-2">
            <span className="opacity-80">Color</span>
            <input
              type="color"
              value={subtitle.color}
              onChange={(e) => onSubtitleChange({ ...subtitle, color: e.target.value })}
              className="w-10 h-6 p-0 bg-transparent border border-white/20 rounded"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={subtitle.background}
              onChange={(e) => onSubtitleChange({ ...subtitle, background: e.target.checked })}
            />
            <span className="opacity-80">Background box</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
