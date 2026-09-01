import { useEffect, useState } from 'react';

const STORAGE_KEY = 'condopay_zoom';
const ZOOM_LEVELS = [90, 100, 110, 125] as const;

function getInitialZoom() {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return ZOOM_LEVELS.includes(stored as (typeof ZOOM_LEVELS)[number])
    ? stored
    : 100;
}

export function ZoomControls() {
  const [zoom, setZoom] = useState(getInitialZoom);
  const currentIndex = ZOOM_LEVELS.indexOf(
    zoom as (typeof ZOOM_LEVELS)[number]
  );

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
    localStorage.setItem(STORAGE_KEY, String(zoom));
  }, [zoom]);

  const zoomOut = () => {
    if (currentIndex > 0) setZoom(ZOOM_LEVELS[currentIndex - 1]);
  };

  const zoomIn = () => {
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  return (
    <div
      role="group"
      aria-label="Display zoom controls"
      className="inline-flex items-center overflow-hidden rounded-full border border-[#d9dce7] bg-white/80 text-[#2c5282] shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-[#a9c8ed]"
    >
      <button
        type="button"
        onClick={zoomOut}
        disabled={currentIndex === 0}
        aria-label="Zoom out"
        title="Zoom out"
        className="px-2.5 py-1.5 font-bold hover:bg-[#f0eff4] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2c5282] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700 dark:focus-visible:outline-[#a9c8ed]"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => setZoom(100)}
        aria-label={`Reset zoom to 100 percent. Current zoom ${zoom} percent`}
        title="Reset zoom to 100%"
        className="border-x border-[#d9dce7] px-2.5 py-1.5 text-sm font-medium hover:bg-[#f0eff4] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:outline-[#a9c8ed]"
      >
        Zoom {zoom}%
      </button>
      <button
        type="button"
        onClick={zoomIn}
        disabled={currentIndex === ZOOM_LEVELS.length - 1}
        aria-label="Zoom in"
        title="Zoom in"
        className="px-2.5 py-1.5 font-bold hover:bg-[#f0eff4] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2c5282] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700 dark:focus-visible:outline-[#a9c8ed]"
      >
        +
      </button>
    </div>
  );
}
