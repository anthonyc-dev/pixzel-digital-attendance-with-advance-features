export const PAGE_BACKGROUND_STORAGE_KEY = 'pixzel-page-background';

export const PAGE_BACKGROUND_CHANGE_EVENT = 'pixzel-page-background-change';

export type PageBackgroundId = 'none' | 'fire' | 'sea' | 'air';

export const PAGE_BACKGROUND_OPTIONS: {
  id: PageBackgroundId;
  label: string;
  description: string;
}[] = [
  {
    id: 'none',
    label: 'Default',
    description: 'Solid theme background only.',
  },
  {
    id: 'fire',
    label: 'Fire',
    description: 'Subtle looping fire video behind the content.',
  },
  {
    id: 'sea',
    label: 'Sea',
    description: 'Calm ocean water video behind the content.',
  },
  {
    id: 'air',
    label: 'Air',
    description: 'Sky and clouds video behind the content.',
  },
];

export const PAGE_BACKGROUND_VIDEO_SOURCES: Record<
  Exclude<PageBackgroundId, 'none'>,
  string
> = {
  fire: '/videos/fire.mp4',
  sea: '/videos/sea.mp4',
  air: '/videos/air.mp4',
};

export function getPageBackgroundVideoSrc(
  id: PageBackgroundId,
): string | null {
  if (id === 'none') return null;
  return PAGE_BACKGROUND_VIDEO_SOURCES[id];
}

export function getStoredPageBackground(): PageBackgroundId {
  if (typeof window === 'undefined') return 'fire';
  const v = localStorage.getItem(PAGE_BACKGROUND_STORAGE_KEY);
  if (v === 'none' || v === 'fire' || v === 'sea' || v === 'air') return v;
  return 'fire';
}

export function setStoredPageBackground(id: PageBackgroundId) {
  localStorage.setItem(PAGE_BACKGROUND_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(PAGE_BACKGROUND_CHANGE_EVENT));
}
