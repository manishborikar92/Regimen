'use client';

import { useEffect, useState } from 'react';

/** Detects the on-screen keyboard via the Visual Viewport API (ignores pinch-zoom). */
export function useKeyboardOpen(minDelta = 150) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const check = () =>
      setOpen(vv.scale <= 1.01 && window.innerHeight - vv.height > minDelta);

    vv.addEventListener('resize', check);
    return () => vv.removeEventListener('resize', check);
  }, [minDelta]);

  return open;
}
