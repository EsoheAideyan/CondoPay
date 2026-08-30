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
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        Zoom {zoom}%
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-600 dark:bg-slate-800">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          Display size
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Increase or decrease text and interface size. Your choice is saved on
          this device.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={currentIndex === 0}
            aria-label="Zoom out"
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            disabled={zoom === 100}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-blue-400"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={currentIndex === ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            A+
          </button>
        </div>
      </div>
    </details>
  );
}
