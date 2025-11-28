'use client';

import { useState, useEffect } from 'react';

export interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
}

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;

      if (currentOffset > prevOffset) {
        setScrollDirection('down');
      } else if (currentOffset < prevOffset) {
        setScrollDirection('up');
      }

      setPrevOffset(currentOffset);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return scrollDirection;
}
