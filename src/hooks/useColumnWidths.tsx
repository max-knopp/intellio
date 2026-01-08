import { useState, useCallback, useEffect } from 'react';

export interface ColumnWidths {
  avatar: number;
  company: number;
  name: number;
  title: number;
  recency: number;
  score: number;
}

const DEFAULT_WIDTHS: ColumnWidths = {
  avatar: 32,
  company: 100,
  name: 140,
  title: 120,
  recency: 60,
  score: 50,
};

const MIN_WIDTHS: ColumnWidths = {
  avatar: 32,
  company: 60,
  name: 80,
  title: 60,
  recency: 50,
  score: 40,
};

const STORAGE_KEY = 'lead-inbox-column-widths';

export function useColumnWidths() {
  const [widths, setWidths] = useState<ColumnWidths>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_WIDTHS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse stored column widths', e);
    }
    return DEFAULT_WIDTHS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  }, [widths]);

  const updateWidth = useCallback((column: keyof ColumnWidths, delta: number) => {
    setWidths((prev) => ({
      ...prev,
      [column]: Math.max(MIN_WIDTHS[column], prev[column] + delta),
    }));
  }, []);

  const resetWidths = useCallback(() => {
    setWidths(DEFAULT_WIDTHS);
  }, []);

  const getGridTemplate = useCallback(() => {
    return `${widths.avatar}px ${widths.company}px ${widths.name}px ${widths.title}px 1fr ${widths.recency}px ${widths.score}px`;
  }, [widths]);

  return { widths, updateWidth, resetWidths, getGridTemplate };
}
