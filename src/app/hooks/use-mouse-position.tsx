'use client';

import { useState, useEffect } from 'react';

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const updateMousePosition = (e: MouseEvent) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 10); // Small debounce for better performance
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return mousePosition;
}
