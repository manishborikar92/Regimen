'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `onDismiss('outside' | 'escape')` on a pointer press outside `ref`
 * or on Escape. Only listens while `enabled`.
 */
export function useDismissable(ref, onDismiss, enabled = true) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onDismissRef.current('outside');
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onDismissRef.current('escape');
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, enabled]);
}
