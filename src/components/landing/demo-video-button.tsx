'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const VIDEO_URL = 'https://res.cloudinary.com/dhh7heemp/video/upload/v1772736846/TrustQRDemo_td0zh8.mp4';

export function DemoVideoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-[#3F3835] bg-[#3F3835] px-10 py-4 [font-family:var(--font-jetbrains)] text-sm font-semibold text-white transition-colors hover:border-[#B55933]/40 hover:bg-[#4a4440]"
      >
        Voir_la_démo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0C0B]/90 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-1 -top-12 flex h-9 w-9 items-center justify-center rounded-full border border-[#3F3835] bg-[#1C1917] text-[#A1887D] transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Video */}
            <div className="overflow-hidden rounded-2xl border border-[#3F3835] shadow-2xl shadow-black/50">
              {/* biome-ignore lint/a11y/useMediaCaption: demo video */}
              <video
                src={VIDEO_URL}
                controls
                autoPlay
                className="w-full"
                onEnded={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
