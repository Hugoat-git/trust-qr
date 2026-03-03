'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  tips?: string[];
}

export function InfoTooltip({ title, description, tips }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 focus:outline-none transition-all duration-200"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Tooltip - opens below */}
          <div className="absolute z-50 top-full left-0 mt-2 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative p-4 bg-popover backdrop-blur-md rounded-xl border border-border shadow-xl">
              {/* Arrow */}
              <div className="absolute -top-1.5 left-4 w-3 h-3 bg-popover rotate-45 border-l border-t border-border" />

              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15">
                  <Info className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-popover-foreground">{title}</h3>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                {tips && tips.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/70">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
