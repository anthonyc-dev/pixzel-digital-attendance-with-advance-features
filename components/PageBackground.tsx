'use client';

import { useEffect, useState } from 'react';
import {
  getPageBackgroundVideoSrc,
  getStoredPageBackground,
  PAGE_BACKGROUND_CHANGE_EVENT,
  type PageBackgroundId,
} from '@/lib/page-background';
import { cn } from '@/lib/utils';

const opacityByVariant = {
  /** Home / kiosk attendance */
  default: 'opacity-[0.14]',
  /** Admin pages (e.g. activities) */
  subtle: 'opacity-[0.06]',
} as const;

export type PageBackgroundVariant = keyof typeof opacityByVariant;

export function PageBackground({ variant = 'default' }: { variant?: PageBackgroundVariant }) {
  const [bg, setBg] = useState<PageBackgroundId>('fire');

  useEffect(() => {
    const sync = () => setBg(getStoredPageBackground());
    sync();
    window.addEventListener(PAGE_BACKGROUND_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PAGE_BACKGROUND_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const videoSrc = getPageBackgroundVideoSrc(bg);
  if (!videoSrc) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 bottom-0 z-[1] w-full overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />
      <video
        key={bg}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={cn(
          'absolute inset-0 h-full w-full max-w-full object-cover',
          opacityByVariant[variant],
        )}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
